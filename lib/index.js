import { EventEmitter } from 'events';

import Router from './router';
import Model from './model';
import Adapter from './adapter';

import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import parseModelName from './utils/parse-model-name';

export default class Restle extends EventEmitter {
  constructor(options = {}) {
    if (typeof options !== 'object')
      throw new TypeError(`Argument "options" must be an object.`);

    super();
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
        (_.isArray(cors) ? _.indexOf(cors, origin) > -1 : origin === cors);

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

    // connect to db
    this.adapter.connect().then(() => this.emit('ready'));

    // use the router
    this.app.use(`${this.namespace}`, this.router.router);

    // start express app
    this.server = this.app.listen(this.port);
  }

  /**
   * Close the express instance and disconnect the adapter.
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
   * This method registers a model, which means three things:
   *
   * 1. An instantiated model is added to this.models (Restle's model registry)
   * 2. The instantiated model's relationships are populated with models
   * 3. All models in the registry with a relationship pointing towards the
   *    instantiated model are populated
   *
   * TODO: refactor into single loop
   *
   * @param {String} name
   * @param {Object} schema
   * @param {Adapter} adapter
   * @return {Promise}
   */
  register(name, schema, adapter = this.adapter) {
    const type = parseModelName(name);
    const options = { namespace: this.namespace, port: this.port, };

    // TODO: create Promise array for custom adapters and fire ready event when all resolved
    if (schema.options && schema.options.adapter) {
      adapter = schema.options.adapter;
      adapter.connect().then(() => {
        console.log(`Adapter for ${name} has connected!`);
      });
    }

    const model = Model.create(name, schema, adapter, options);

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

    return model;
  }

  /**
   * Alias for an 'after' event.
   *
   * @param {String} event
   */
  after(event, cb) {
    return this.on(`${event}.after`, cb);
  }

  /**
   * Alias for a 'before' event.
   *
   * @param {String} event
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
