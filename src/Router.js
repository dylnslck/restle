/* eslint-disable no-unused-vars */
export default class Router {
  /**
   * Instantiates a `Router`.
   *
   * @constructor
   * @private
   * @param {Object} [options={}]
   * @param {Number} [options.port=5000]
   * @param {String} [options.namespace=api]
   * @param {String} [options.version=v1]
   */
  constructor(options = {}) {
  }

  /**
   * Returns a resolved promise when the router is up and running, i.e. an Express HTTP server has
   * initialized or a WebSocket handshake.
   *
   * @async
   * @private
   * @return {Boolean}
   */
  connect() {
  }

  /**
   * Returns a resolved promise when the router has successfully disconnected, i.e. an Express HTTP
   * server is closed or a WebSocket connection is broken.
   *
   * @async
   * @private
   * @return {Boolean}
   */
  disconnect() {
  }

  /**
   * Sets up Express routes.
   *
   * @private
   * @param  {[type]} routes [description]
   * @return {[type]}        [description]
   */
  setup(routes) {
  }
}
