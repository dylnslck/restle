/* eslint-disable no-unused-vars */
/** The Router class. */
export default class Router {
  /**
   * Instantiates a `Router`.
   *
   * @constructor
   * @private
   * @param {Object} [options={}]
   * @param {Number} [options.port=5000]
   * @param {String} [options.namespace='']
   * @param {Serializer} [options.serializer='require('./Serializer')']
   */
  constructor(options = { port: 5000, namespace: '', serializer: require('./Serializer') }) {
  }

  /**
   * Returns a resolved promise when the router is up and running, i.e. an Express HTTP server has
   * initialized or a WebSocket handshake.
   *
   * @private
   * @async
   *
   * @todo Throws
   */
  connect() {
  }

  /**
   * Returns a resolved promise when the router has successfully disconnected, i.e. an Express HTTP
   * server is closed or a WebSocket connection is broken.
   *
   * @private
   * @async
   */
  disconnect() {
  }
  /**
   * @callback routerCallback
   *
   * @see {@link http://expressjs.com/en/4x/api.html}
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  /**
   * Sets up Express routes.
   *
   * @private
   * @param {String} route
   * @param {String} method
   * @param {routerCallback} cb
   *
   * @todo Throws
   */
  mount(route, method, cb) {
  }
}
