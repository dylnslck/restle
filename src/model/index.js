export default class Model {
  constructor(name, schema) {

  }

  /**
   * Finds resources that match the options criteria.
   *
   * ```js
   * app.model('user').find({
   *   page: { offset: 20, limit: 40 },
   *   sort: { name: 'asc', age: 'desc' },
   *   fields: { password: false },
   *   include: { pets: false }
   *   filter: {
   *     age: { $gt: 20, $lte: 10 },
   *     name: { $in: [ 'Billy', 'Bob' ] },
   *     username: 'billybob',
   *   },
   * }).then(users => {
   *   // ResourceArray
   * });
   * ```
   *
   * The `options` argument allows for pagination, sorting, sparse fieldsets,
   * filtering and related resource inclusion. These data fetching mechanisms
   * are defined in the [JSON API specification](http://jsonapi.org/format/#fetching).
   *
   * The following operators are allowed by filtering:
   *
   * 1. **$gt** - greater than
   * 2. **$gte** - greater or equal than
   * 3. **$lt** - less than
   * 4. **$lte** - less or equal than
   * 5. **$eq** - equal to
   * 6. **$neq** - not equal to
   * 7. **$in** - includes
   *
   * The omission of an operator, such as the `username` filter in the example
   * above, assumes that the `$eq` operator should be invoked.
   *
   * @param  {Object} [options={}]
   * @return {Promise<ResourceArray>}
   */
  find(options = {}) {

  }

  /**
   * Returns the first object found matching the options criteria. This is
   * identical to `find` but extracts the first resource.
   *
   * @param  {Object} [options={}]
   * @return {Promise<Resource>}
   */
  findOne(options = {}) {

  }

  /**
   * Retrieves a single resource of id `id`.
   *
   * ```js
   * app.model('user').findResource('1234').then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param  {String} id
   * @return {Promise<Resource>}
   */
  findResource(id) {

  }

  /**
   * Retrieves the resource(s) related to a particular resource identified by id
   * according to the relationship. You can pass the same options as you would
   * in find. A relationship with multiplicity of many returns a ResourceArray,
   * and a relationship with a multiplicity of one returns a Resource.
   *
   * ```js
   * // pretend user `1234` has a ton of pets
   * app.model('user').findRelated('1234', 'pets', {
   *   page: { offset: 20, limit: 40 },
   *   filter: {
   *     age: { $gt: 2, $lte: 5 },
   *     species: 'hamster',
   *   },
   * }).then(pets => {
   *   // ResourceArray
   * });
   *
   * app.model('user').findRelated('1234', 'company').then(company => {
   *   // Resource
   * });
   * ```
   *
   * @param  {String} id - The ID of the parent resource.
   * @param  {String} relationship - The relationship to the parent.
   * @param  {Object} [options={}] - Same options object used by `find`.
   * @return {Promise<Resource|ResourceArray}
   */
  findRelated(id, relationship, options = {}) {

  }

  /**
   * Persists a record in the database and creates a resource. The data object
   * must be a flattened JSON with attributes and relationships, which are
   * represented by ids.
   *
   * ```js
   * app.model('user').create({
   *   name: 'Dylan',
   *   email: 'dylanslack@gmail.com',
   *   password: 'supersecret',
   *   pets: [ '1', '2', '3' ],
   *   company: '4',
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param  {Object} data
   * @return {Promise<Resource>}
   */
  create(data) {

  }

  /**
   * Updates a record in the database and creates a resource. The data object
   * must be a flattened JSON with attributes and relationships, which are
   * represented by ids. Missing attributes and relationships are not
   * interpreted as null.
   *
   * ```js
   * app.model('user').update('1234', {
   *   name: 'Dylan Slack',
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param  {String} id - The ID of the resource to update.
   * @param  {Object} data
   * @return {Promise<Resource>}
   */
  update(id, data) {

  }

  /**
   * Deletes a record from the database and resolves to true if that operation
   * succeeded.
   *
   * @param  {String} id - The ID of the resource to delete.
   * @return {Promise<Boolean>}
   */
  delete(id) {

  }
}