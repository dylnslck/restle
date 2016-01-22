import { EventEmitter } from 'events';

import Router from './router';
import Model from './model';
import Adapter from 'restle-memory';

import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import parseModelName from './utils/parse-model-name';
import assignOptions from './utils/assign-options';
import configureCors from './utils/configure-cors';
import configureBodyParser from './utils/configure-body-parser';

/**
 * Restle is a database-agnostic, JSON API engine. Restle handles data objects
 * and the relationships between them. Restle has an in-memory adapter baked in,
 * which means you can begin creating a Restle app without a database in mind.
 *
 * ```js
 * const Restle = require('restle');
 * const app = new Restle({
 *   port: 3000,
 *   namespace: 'api',
 * });
 *
 * app.on('ready', () => console.log('Listening on port ${app.port}'));
 * ```
 *
 * @class Restle
 * @constructor
 * @param {Object} options
 */
export default class Restle extends EventEmitter {
  constructor(options = {}) {
    if (typeof options !== 'object')
      throw new TypeError(`Argument "options" must be an object.`);

    super();

    // FIXME: hacky
    options.restle = this;

    assignOptions(this, options);
    configureBodyParser(this);
    configureCors(this);

    // use the router
    this.app.use(`${this.namespace}`, this.router.router);

    // start express app
    this.server = this.app.listen(this.port);
  }

  /**
   * Asynchronously disconnect the HTTP server and database adapters.
   *
   * @return {Promise}
   */
  disconnect() {
    const models = this.models;
    const adapters = [];

    return new Promise((resolve, reject) => {
      // close express server
      this.server.close();

      for (let model in models)
        adapters.push(models[model].adapter.disconnect());

      Promise.all(adapters).then(() => {
        this.emit('disconnected');
        return resolve();
      }).catch(err => {
        return reject(err);
      });
    });
  }

  /**
   * This method registers a model of type `name` with `schema`.
   *
   * @todo Refactor into single loop.
   * @todo Remove lodash dependency.
   * @param {Object} schemas
   * @return {Promise}
   */
  register(schemas) {
    const adapters = [];
    adapters.push(this.adapter.connect());

    for (let name in schemas) {
      let adapter = this.adapter;
      let schema = schemas[name];
      let type = parseModelName(name);

      // override default adapter
      if (schema.options && schema.options.adapter) {
        adapter = schema.options.adapter;
        adapters.push(adapter.connect());
      }

      let model = Model.create(name, schema, adapter);

      // populate created model relationships
      this.models[type] = model;

      _.each(model.relationships, relationship => {
        _.forOwn(this.models, (value, key) => {
          if (value.type === type) return;

          if (value.type === relationship.type) {
            relationship.model = value;
            return false;
          }
        });
      });

      // populate all other models relationships
      _.forOwn(this.models, (value, key) => {
        if (key === type) return false;

        _.each(value.relationships, relationship => {
          if (relationship.type === type) {
            relationship.model = model;
            return false;
          }
        });
      });
    }

    Promise.all(adapters).then(() => this.emit('ready'));
  }

  /**
   * This method fires an event after a resource is created within Restle, but
   * before that resource is serialized by the router.
   *
   * @param {String} event
   * @callback {afterCallback} cb
   */
  after(event, cb) {
    return this.on(`${event}.after`, cb);
  }

  /**
   * This method fires an event before a resource is created within Restle.
   *
   * ```js
   * app.before('user.create', (req, res, next) => {
   *   const numRounds = 10;
   *   const password = req.body.data.attributes.password;
   *
   *   bcrypt.hash(password, numRounds, (err, hash) => {
   *     if (err) {
   *       return res.status(500).json(err);
   *     }
   *
   *     req.body.data.attributes.password = hash;
   *     return next();
   *   });
   * })
   * ```
   *
   * @param {String} event
   * @callback {beforeCallback} cb
   */
  before(event, cb) {
    return cb
      ? this.on(`${event}.before`, cb)
      : this.on('before', event);
  }

  /**
   * Returns a model from the models registry.
   *
   * @param {String} name
   * @return {Model} model
   */
  model(name) {
    return this.models[parseModelName(name)];
  }

  /**
   * Create a custom route at `/endpoint` with the HTTP verb `method`.
   * The callback function takes in the express objects `req`, `res`
   * and `next`.
   *
   * ```js
   * app.route('/protected', 'post', (req, res, next) => {
   *   if (req.get('authorization') !== process.env.API_KEY) {
   *     return res.sendStatus(403);
   *   }
   *
   *   return next();
   * });
   * ```
   *
   * @param {String} endpoint
   * @param {String} method
   * @param {Function} callback
   */
  route(endpoint, method, callback) {
    const app = this.app;
    const router = new express.Router();

    router.route('/')[method](callback);
    app.use(endpoint, router);
  }
}
