/* eslint-disable no-unused-vars */
import { EventEmitter } from 'events';

/**
 * The Restle class.
 *
 * @extends EventEmitter
 */
export default class Restle extends EventEmitter {
  /**
   * Instantiates a `Restle` app.
   *
   * ```js
   * const Restle = require('restle');
   * const schemas = require('./schemas.js');
   *
   * const app = new Restle({ schemas });
   *
   * app.ready(() => console.log(`Ready on port ${app.port}!`));
   * ```js
   *
   * @constructor
   * @param {Object} [options={}]
   * @param {Object} [options.schemas]
   * @param {Adapter} [options.schemas.adapter=require('./Adapter')]
   * @param {Object} [options.routes]
   * @param {Number} [options.routes.port=5000]
   * @param {String} [options.routes.namespace='']
   * @param {Serializer} [options.routes.serializer=require('./Serializer')]
   *
   * @todo Throws
   */
  constructor(options = {
    schemas: { adapter: require('./Adapter') },
    routes: { port: 5000, namespace: '', serializer: require('./Serialier') },
  }) {
    super();
  }

  /**
   * Returns a `Model` or `ModelArray` instance with the matching name from Restle's model registry.
   * Any string in `types` after a colon will be added to the model's aliases'.
   *
   * ```js
   * const model = app.model('user');
   * const modelArray = app.model('user', 'animal:pets');
   * ```
   *
   * @param {...String} types
   * @returns {Model|ModelArray}
   *
   * @todo Throws
   */
  model(...types) {
  }

  /**
   * Alias for `app.on('ready', cb)`.
   *
   * @async
   */
  ready() {
  }

  /**
   * Fires a request soon as the router receives data. If this function takes one argument, then the
   * it is fired before every request. This is an opportunity to perform things like authentication
   * and logging.
   *
   * ```js
   * app.before().then((...) => {
   *   // Fires before any requests touch the adapter.
   * });
   *
   * app.before('user.create').then((...) => {
   *   // Fires before a user is created.
   * });
   * ```
   *
   * @async
   * @param {String} [event='']
   *
   * @todo Figure out arguments for the callbacks.
   */
  before(event = '') {
  }

  /**
   * Fires right before data is delivered to the client. If this function takes one argument, then
   * the it is fired after every request. This is an opportunity to perform any last minute changes
   * before data is sent back to the client.
   *
   * ```js
   * app.after().then((...) => {
   *   // Fires after any type of requests returns from the adapter.
   * });
   *
   * app.after('user.create').then((...) => {
   *   // Fires after a user is created.
   * });
   * ```
   *
   * @async
   * @param {String} [event='']
   *
   * @todo Figure out the arguments for the callbacks.
   */
  after(event = '', cb) {
  }

  /**
   * Disconnects all the adapters and closes the router.
   *
   * @async
   */
  disconnect() {

  }
}
