import { EventEmitter } from 'events';

import Router from './router';
import Model from './model';
import Adapter from 'restle-memory';

import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import parseModelName from './utils/parse-model-name';

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

    // instantiate models hash
    this.models = {};

    Object.assign(this, {
      adapter: options.adapter || new Adapter(),
      router: new Router(options),
      app: express(),
      namespace: options.namespace ? `/${options.namespace}` : '',
      port: options.port || 3000,
      cors: options.cort || '*',
    });

    // body parsing middleware
    this.app.use(bodyParser.json({ type: 'application/*+json' }));
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // configure cors
    this.app.use((req, res, next) => {
      const cors = this.cors;
      const origin = req.get('origin');

      if (!cors) return next();

      const isOriginAllowed = cors === '*' ||
        (Array.isArray(cors) ? cors.indexOf(origin) > -1 : origin === cors);

      if (isOriginAllowed) {
        const allowedHeaders = [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
        ];

        const allowedMethods = [
          'OPTIONS',
          'GET',
          'POST',
          'PATCH',
          'DELETE',
        ];

        res.set('access-control-allow-origin', origin);
        res.set('access-control-allow-headers', allowedHeaders);
        res.set('access-control-allow-methods', allowedMethods);
      }

      if (req.method === 'OPTIONS') return res.sendStatus(isOriginAllowed ? 200 : 403);

      return next();
    });

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
    return new Promise((resolve, reject) => {
      // close express server
      this.server.close();

      // disconnect the adapter
      this.adapter.disconnect().then(() => {
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
   * @todo Add adapter connections to a Promise array.
   * @todo Remove lodash dependency.
   * @param {String} name
   * @param {Object} schema
   * @param {Adapter} adapter
   * @return {Promise}
   */
  register(schemas) {
    let adapters = [];

    // connect to db
    adapters.push(this.adapter);

    for (let name in schemas) {
      let adapter = this.adapter;
      let schema = schemas[name];
      let type = parseModelName(name);

      // override default adapter
      if (schema.options && schema.options.adapter) {
        adapter = schema.options.adapter;
        adapters.push(adapter);
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
    return this.models[parseModelName(name)] || undefined;
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
