/* eslint-disable no-unused-vars */
/**
 * The ModelArray class.
 *
 * @todo Think about iterator.
 */
export default class ModelArray {
  /**
   * Instantiates a ModelArray.
   *
   * @constructor
   * @private
   * @param {Model[]} models
   * @throws {ModelError}
   */
  constructor(models) {
  }

  /**
   * Callback for each model.
   *
   * @callback modelCallback
   * @param {Model} model
   */
  /**
   * Returns an object of values returned by each `modelCallback`.
   *
   * ```js
   * // give all the pets to user `1`
   * app.model('user', 'pets').each(
   *   user => user.findResource('1'),
   *   pets => animal.find()
   * ).then(results => {
   *   // results
   * });
   * ```
   *
   * @async
   * @param {...modelCallback}
   * @returns {Object}
   * @throws {AdapterError}
   *
   * @todo Do something with the results in the example.
   */
  each() {
  }
}
