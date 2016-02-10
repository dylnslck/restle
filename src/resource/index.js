export default class Resource {
  /**
   * Instantiates a new Resource.
   *
   * @param {Model} model
   * @param {Object} data
   */

  constructor(model, data) {

  }

  /**
   * Fetches the resource(s) related to the resource. If the relationship's
   * multiplicity is many, it will return a ResourceArray, and if the
   * relationship's multiplicity is one, it will return a Resource.
   *
   * ```js
   * user.fetch('pets').then(pets => {
   *   // ResourceArray
   * });
   *
   * user.fetch('company').then(company => {
   *   // Resource
   * });
   * ```
   *
   * @param {String} relationship
   * @return {Promise<Resource|ResourceArray>}
   */

  fetch(relationship) {

  }

  /**
   * Returns the value of the resource's attribute.
   *
   * ```js
   * const name = user.attribute('name'); // Bob
   * ```
   *
   * @param {String} attribute
   * @return {String|Number|Boolean|Date}
   */

  attribute(attribute) {

  }

  /**
   * Returns a Relationship instance.
   *
   * ```js
   * const pets = user.relationship('pets'); // Relationship
   * ```
   *
   * @param {String} relationship
   * @return {Relationship}
   */

  relationship(relationship) {

  }

  /**
   * Updates and persists the resource. The data object must be a flattened JSON
   * with attributes and relationships, which are represented by ids.
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
   * @param {Object} data
   * @return {Promise<Resource>}
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
   * @return {Promise<Boolean>}
   */

  delete() {

  }
}
