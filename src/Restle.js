/* eslint-disable no-unused-vars */
import { EventEmitter } from 'events';

export default class Restle extends EventEmitter {
  /**
   * Instantiates a Restle app.
   *
   * ```js
   * const Restle = require('restle');
   * const port = 3000;
   * const namespace = 'api';
   *
   * const schemas = {
   *   user: {
   *     attributes: {
   *       name: { type: 'string' },
   *       email: { type: 'string', unique },
   *     },
   *   },
   * };
   *
   * const app = new Restle({ port, namespace, schemas });
   *
   * app.ready(() => console.log(`Ready on port ${app.port}!`));
   * ```js
   *
   * @param {Object} [options={}]
   * @param {Object} [options.adapter]
   * @param {Object} [options.schemas]
   * @param {Object} [options.routes]
   * @param {Number} [options.port=5000]
   * @param {String} [options.namespace='api']
   */
  constructor(options = {}) {

  }

  /**
   * Returns a Model instance with the matching name from Restle's model
   * registry.
   *
   * ```js
   * const model = app.model('user');
   * ```
   *
   * @param {String} name
   * @returns {Model}
   */
  model(name) {

  }

  /**
   * Registers all the schemas and instantiates Restle's model registry. If the
   * schemas key is missing from the constructor options argument, then this
   * method must be called externally before the app will be ready.
   *
   * @param {Object} schemas
   */
  register(schemas) {

  }

  /**
   * Fires when the app is ready, which means the server is listening and the
   * schema adapters are done connecting to their respective persistence layers.
   *
   * @param {Function} cb
   */
  ready(cb) {

  }

  /**
   * Fires before a request touches the adapter. If this function takes one
   * argument, then the callback is fired before every request. This is an
   * opportunity to perform things like authentication and logging.
   *
   * ```js
   * app.before((...) => {
   *   // Fires before any requests touch the adapter.
   * });
   *
   * app.before('user.create', (...) => {
   *   // Fires before a user is created.
   * });
   * ```
   *
   * @param {String} [event] - Either the event name or callback.
   * @param {Function} cb
   *
   * @todo Figure out arguments for the callbacks.
   */
  before(event, cb) {

  }

  /**
   * Fires after a request returns from the adapter. If this function takes one
   * argument, then the callback is fired after every request. This is an
   * opportunity to perform any last minute changes before data is sent back
   * to the client.
   *
   * ```js
   * app.after((...) => {
   *   // Fires after any type of requests returns from the adapter.
   * });
   *
   * app.after('user.create', (...) => {
   *   // Fires after a user is created.
   * });
   * ```
   *
   * @param {String} [event] - Either the event name or callback.
   * @param {Function} cb
   *
   * @todo Figure out the arguments for the callbacks.
   */
  after(event, cb) {

  }
}
