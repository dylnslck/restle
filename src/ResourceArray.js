/* eslint-disable no-unused-vars */
/** The ResourceArray class. */
export default class ResourceArray {
  /**
   * Instantiates a `ResourceArray`.
   *
   * @constructor
   * @private
   * @param {Resource[]} resources
   */
  constructor(resources) {
  }

  /**
   * Returns an object of values returned by each function in `methods`.
   *
   * ```js
   * app.model('user:users').find().then(users => {
   *   return users.map({
   *     users(resource) {
   *       return resource.delete();
   *     },
   *   });
   * }).then(results => {
   *   console.log(results.users); // [true, true, true], there were 3 users in the db
   * }).catch(err => {
   *   console.log(err);
   * });
   * ```
   *
   * @async
   * @param {Object} methods
   * @returns {Object}
   *
   * @todo Throws
   * @todo Do something with the results in the example.
   * @todo Better name for `methods` argument.
   */
  map(methods) {
  }

  /**
   * Callback called on each model iteration.
   *
   * @callback {resourceCallback}
   * @param {Resource} resource
   */
  /**
   * Iterates over the resources.
   *
   * ```js
   * app.model('user').find().then(users => {
   *   users.each(user => {
   *     // do whatever you want!
   *   });
   * });
   * ```
   *
   * @see Array#forEach
   * @param {resourceCallback} cb
   *
   * @todo Throws
   * @todo Do something in the example.
   */
  each(cb) {
  }
}
