/* eslint-disable no-unused-vars */
/** The ModelArray class. */
export default class ModelArray {
  /**
   * Instantiates a `ModelArray`.
   *
   * @constructor
   * @private
   * @param {Model[]} models
   */
  constructor(models) {
  }

  /**
   * Returns an object of values returned by each function in `methods`.
   *
   * ```js
   * app.model('user', 'animal:pets').map({
   *   user(model) {
   *     // model === app.model('user')
   *     return model.findResource('1');
   *   },
   *   pets(model) {
   *     // model === app.model('animal')
   *     return model.find({
   *       page: { offset: 20, limit: 40 },
   *       filter: { age: 5 },
   *     });
   *   },
   * }).then(results => {
   *   const user = results.user; // Resource
   *   const pets = results.pets; // ResourceArray
   *
   *   return results.user.put({ pets });
   * }).then(user => {
   *   // Resource
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
   * @callback {modelCallback}
   * @param {Model} model
   */
  /**
   * Iterates over the models.
   *
   * ```js
   * app.model('user', 'animal').each(model => {
   *   // do whatever you want!
   * });
   * ```
   *
   * @see Array#forEach
   * @param {modelCallback} cb
   *
   * @todo Throws
   * @todo Do something in the example.
   */
  each(cb) {
  }
}
