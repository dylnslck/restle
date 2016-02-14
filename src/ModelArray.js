/* eslint-disable no-unused-vars */
/**
 * The ModelArray class.
 *
 * @todo Think about iterator.
 */
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
   * Returns an object of values returned by each `modelCallback`.
   *
   * ```js
   * app.model('user', 'animal:pets').map({
   *   user(model) {
   *     // model === app.model('user')
   *     return model.findResource('1');
   *   },
   *
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
   *   return results.user.put('pets', pets);
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {Object} methods
   * @returns {Object}
   * @throws {Error}
   *
   * @todo Do something with the results in the example.
   */
  map(methods) {
  }

  /**
   * Callback called on each model iteration.
   *
   * @callback {modelCallback}
   */
  /**
   * Iterates over the models.
   *
   * ```js
   * app.model('user', 'animal').each(model => model.find()).then(resources => {
   *   // ResourceArray
   * });
   * ```
   *
   * @param {modelCallback} cb
   * @return {[type]} [description]
   */
  each(cb) {
  }
}
