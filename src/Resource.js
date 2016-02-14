/* eslint-disable no-unused-vars */
/** The Resource class. */
export default class Resource {
  /**
   * Instantiates a `Resource`.
   *
   * @constructor
   * @private
   * @param {Model} model
   * @param {Object} data
   */
  constructor(model, data) {
  }

  /**
   * Returns the value of the resource's attribute.
   *
   * ```js
   * app.model('user').findOne({ filter: { name: 'Bob' } }).then(user => {
   *   console.log(user.attribute('name')); // Bob
   * });
   * ```
   *
   * @param {String} name
   * @returns {*}
   *
   * @todo Throws
   */
  attribute(name) {
  }

  /**
   * Returns the value of the resource's relationship. If the relationship's multiplicity is `many`,
   * it will return an array of strings, and if the relationship's multiplicity is `one`, it will
   * return a string.
   *
   * ```js
   * app.model('user').findOne({ filter: { company: '1' } }).then(user => {
   *   console.log(user.relationship('company')); // '1'
   * });
   *
   * app.model('user').findOne({ filter: { pets: ['3', '5'] } }).then(user => {
   *   console.log(user.relationship('pets')); // ['3', '5']
   * });
   * ```
   *
   * @param {String} name
   * @returns {String|String[]}
   *
   * @todo Throws
   */
  relationship(name) {
  }

  /**
   * Returns the resource(s) related to the resource. If the relationship's multiplicity is `many`,
   * it will return a `ResourceArray`, and if the relationship's multiplicity is `one`, it will
   * return a `Resource`.
   *
   * ```js
   * // pretend user `1` has a ton of pets
   * app.model('user').findResource('1').then(user => {
   *   return user.fetch('pets');
   * }).then(pets => {
   *   // ResourceArray
   * });
   *
   * // pretend user `1` has a company
   * app.model('user').findResource('1').then(user => {
   *   return user.fetch('company');
   * }).then(company => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} relationship
   * @returns {Resource|ResourceArray}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  fetch(relationship) {
  }

  /**
   * Updates and persists the resource. The data object must be a flattened JSON with attributes and
   * relationships, which are represented by ids.
   *
   * ```js
   * app.model('user').findOne({ filter: { name: 'Bob' } }).then(user => {
   *   return user.update({
   *     name: 'Billy',
   *     pets: ['3', '5'],
   *     company: '5',
   *   });
   * }).then(user => {
   *   console.log(user.attribute('name')); // Billy
   *   console.log(user.relationship('pets')); // ['3', '5']
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
   * app.model('user').findOne({ filter: { name: 'Bob' } }).then(user => {
   *   return user.delete();
   * }).then(success => {
   *   console.log(success); // true
   * }).catch(err => {
   *   console.log(err);
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
   * Sets the relationship to the members of `target`. If the member has a multiplicity of `one`,
   * then the value of the member can be either a string id or a `Resource`. If the member has a
   * multiplicity of `many`, then the value of the member can be a string id, an array of string
   * ids, a `Resource`, or a `ResourceArray`.
   *
   * ```js
   * // let's give user `1` all the pets that are 5 years or younger
   * app.model('user', 'animal:pets').map({
   *   user(model) {
   *     // model === app.model('user')
   *     return model.findResource('1');
   *   },
   *   pets(model) {
   *     // model === app.model('animal')
   *     return model.find({
   *       filter: { age: { $lte: 5 } },
   *     });
   *   },
   * }).then(results => {
   *   return results.user.put({ pets: results.pets });
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {Object} target
   * @returns {Resource}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  put(target) {
  }

  /**
   * Removes this reource's relationships in the members of `target`. If the relationships have a
   * multiplicity of `one`, then the value of the member can be either a string id or a `Resource`.
   * If the relationships have a multiplicity of `many`, then the value of the member can be a
   * string id, an array of string ids, a `Resource`, or a `ResourceArray`.
   *
   * ```js
   * // now let's take away all the pets that are older than 5 years from user `1`
   * app.model('user', 'animal:pets').map({
   *   user(model) {
   *     // model === app.model('user')
   *     return model.findResource('1');
   *   },
   *   pets(model) {
   *     // model === app.model('animal')
   *     return model.find({
   *       filter: { age: { $gt: 5 } },
   *     });
   *   },
   * }).then(results => {
   *   return results.user.pop({ pets: results.pets });
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {Object} target
   * @returns {Resource}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  pop(target) {
  }
}
