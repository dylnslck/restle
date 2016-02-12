/* eslint-disable no-unused-vars */
export default class Resource {
  /**
   * Instantiates a Resource.
   *
   * @constructor
   * @private
   * @param {Model} model
   * @param {Object} data
   */
  constructor(model, data) {
  }

  /**
   * Returns the resource(s) related to the resource. If the relationship's multiplicity is many, it
   * will return a ResourceArray, and if the relationship's multiplicity is one, it will return a
   * Resource.
   *
   * ```js
   * // pretend user `1` has a ton of pets
   * user.relationship('pets').then(pets => {
   *   // ResourceArray
   * });
   *
   * // pretend user `1` has a company
   * user.relationship('company').then(company => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} relationship
   * @returns {Resource|ResourceArray}
   * @throws {RelationshipError}
  */
  relationship(relationship) {
  }

  /**
   * Returns the value of the resource's attribute.
   *
   * ```js
   * const name = user.attribute('name'); // Bob
   * ```
   *
   * @param {String} attribute
   * @returns {String|Number|Boolean|Date}
   * @throws {AttributeError}
   */
  attribute(attribute) {
  }

  /**
   * Updates and persists the resource. The data object must be a flattened JSON with attributes and
   * relationships, which are represented by ids.
   *
   * ```js
   * user.update({
   *   name: 'Billy',
   *   pets: [ '3', '5' ],
   *   company: '5',
   * }).then(billy => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {Object} data
   * @returns {Resource}
   * @throws {AdapterError}
   */
  update(data) {
  }

  /**
   * Deletes the resource from the appropriate persistence layer.
   *
   * ```js
   * user.delete().then(success => {
   *   // Boolean
   * });
   * ```
   *
   * @async
   * @returns {Boolean}
   * @throws {AdapterError}
   */
  delete() {
  }

  /**
   * Sets the relationship to `target`. If `relationship` has a multiplicity of `one`, then `target`
   * can be either a string id or `Resource`. If `relationship` has a multiplicity of `many`, then
   * `target` can include everything from `one` including an array of string ids or a
   * `ResourceArray`.
   *
   * ```js
   * // give all the pets to user `1`
   * app.model('user', 'pets').each(
   *   user => user.findResource('1'),
   *   pets => pets.find()
   * ).then(results =>
   * 	results.user.put('pets', results.pets)
   * ).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} relationship
   * @param {...Resource|ResourceArray|String|String[]} target
   * @returns {Resource}
   * @throws {AdapterError|RelationshipError}
   *
   * @todo Do something with the Resource in the example.
   */
  put(relationship, target) {
  }

  /**
   * Removes `target` from `relationship`. If `relationship` has a multiplicity of `one`, then
   * `target` can be either a string id or `Resource`. If `relationship` has a multiplicity of
   * `many`, then `target` can include everything from `one` including an array of string ids or a
   * `ResourceArray`.
   *
   * If `target` is undefined, then `relationship` will become null if its multiplicity is `one` or
   * and empty array if its `multiplicity` is `many`.
   *
   * ```js
   * // give all the pets to user `1`
   * app.model('user', 'pets').each(
   *   user => user.findResource('1'),
   *   pets => pets.find()
   * ).then(results =>
   * 	results.user.pop('pets', results.pets)
   * ).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} relationship
   * @param {...Resource|ResourceArray|String|String[]} [target]
   * @returns {Resource}
   * @throws {AdapterError|RelationshipError}
   *
   * @todo Do something with the Resource in the example.
   */
  pop(relationship, target) {
  }
}
