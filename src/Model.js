/* eslint-disable no-unused-vars */
/** The Model class. */
export default class Model {
  /**
   * Instantiates a `Model`.
   *
   * @constructor
   * @private
   * @param {String} type
   * @param {Object} schema
   */
  constructor(type, schema) {
  }

  /**
   * Adds an alias to this model.
   *
   * @private
   * @param {String} name
   */
  alias(name) {
  }

  /**
   * Finds resources that match the criteria in `options`.
   *
   * The `options` argument allows for pagination, sorting, sparse fieldsets, filtering and related
   * resource inclusion. These data fetching mechanisms are defined in the
   * [JSON API specification](http://jsonapi.org/format/#fetching).
   *
   * The following operators are allowed for filtering, and they extend the JSON API filtering
   * recommendation
   * [JSON API filtering recommendation](http://jsonapi.org/recommendations/#filtering).
   *
   * 1. **$gt** - greater than
   * 2. **$gte** - greater or equal than
   * 3. **$lt** - less than
   * 4. **$lte** - less or equal than
   * 5. **$eq** - equal to
   * 6. **$neq** - not equal to
   * 7. **$in** - includes
   * 8. **$nin** - excludes
   * @todo Set theory
   *
   * The omission of an operator, such as the `country` filter in the example below invokes the
   * `$eq` operator by default.
   *
   * ```js
   * app.model('user').find({
   *   page: { offset: 20, limit: 40 },
   *   sort: { name: 'asc', age: 'desc' },
   *   fields: { password: false },
   *   include: { pets: true },
   *   filter: {
   *     age: { $gt: 10, $lte: 20 },
   *     name: { $in: [ 'Billy', 'Bob' ] },
   *     country: 'US',
   *   },
   * }).then(users => {
   *   // ResourceArray
   * });
   * ```
   *
   * @async
   * @param {Object} [options={}]
   * @returns {ResourceArray}
   * @throws {AdapterError}
   *
   * @todo Throws
   * @todo Do something with the ResourceArray in the example.
   */
  find(options = {}) {
  }

  /**
   * Finds the first resource that matches the `options` criteria.
   *
   * @see find
   * @async
   * @param {Object} [options={}]
   * @returns {Resource}
   *
   * @todo Throws
   */
  findOne(options = {}) {
  }

  /**
   * Retrieves the resource corresponding to `id`.
   *
   * ```js
   * app.model('user').findResource('1').then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} id
   * @returns {Resource}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  findResource(id) {
  }

  /**
   * Retrieves the resource(s) related to a particular resource identified by `id` according to
   * `relationship`. A relationship with a multiplicity of `many` returns a `ResourceArray`, and a
   * relationship with a multiplicity of `one` returns a `Resource`.
   *
   * ```js
   * // pretend user `1` has a ton of pets
   * app.model('user').findRelated('1', 'pets', {
   *   page: { offset: 20, limit: 40 },
   *   filter: {
   *     age: { $gt: 2, $lte: 5 },
   *     species: 'hamster',
   *   },
   * }).then(pets => {
   *   // ResourceArray
   * });
   *
   * // pretend user `1` has a company
   * app.model('user').findRelated('1', 'company').then(company => {
   *   // Resource
   * });
   * ```
   *
   * @see find
   * @async
   * @param {String} id - The id of the parent resource.
   * @param {String} relationship - The relationship to the parent.
   * @param {Object} [options={}]
   * @returns {Resource|ResourceArray}
   *
   * @todo Throw
   * @todo Do something with the Resource and ResourceArray in the example.
   */
  findRelated(id, relationship, options = {}) {
  }

  /**
   * Persists a record in the database and creates a resource. The data object must be a flattened
   * JSON with attributes and relationships which are represented by ids.
   *
   * ```js
   * app.model('user').create({
   *   name: 'Dylan',
   *   email: 'dylanslack@gmail.com',
   *   password: 'supersecret',
   *   pets: [ '1', '2', '3' ],
   *   company: '1',
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {Object} data
   * @returns {Resource}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  create(data) {
  }

  /**
   * Updates a record in the database and creates a resource. The data object must be a flattened
   * JSON with attributes and relationships, which are represented by ids. Missing attributes and
   * relationships are not interpreted as null.
   *
   * ```js
   * app.model('user').update('1', {
   *   name: 'Miguel Oller',
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @async
   * @param {String} id
   * @param {Object} data
   * @returns {Resource}
   *
   * @todo Throws
   * @todo Do something with the Resource in the example.
   */
  update(id, data) {
  }

  /**
   * Deletes a record from the database and resolves to true if the operation succeeded.
   *
   * ```js
   * app.model('user').delete('1').then(success => {
   *   console.log(success); // true
   * }).catch(err => {
   *   console.log(err);
   * });
   * ```
   *
   * @async
   * @param {String} id
   * @returns {Boolean}
   *
   * @todo Throws
   */
  delete(id) {
  }

  /**
   * Sideloads a json object by retrieving relevant data from relationship ids.
   *
   * @private
   * @async
   * @param {Object} data
   * @returns {Object}
   * @throws {AdapterError}
   */
  populate(data) {
  }
}
