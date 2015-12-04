import Resource from './resource';
import ResourceArray from './resource-array';
import Relationship from './relationship';
import _ from 'lodash';

/**
 * A Model defines the relationships and attributes of a resource using a
 * schema. The Model class is used to create, read, update, and delete resources
 * using an Adapter.
 *
 * @class Model
 */
export default class Model {
  /**
   * @ignore
   */
  constructor(type, schema, adapter, options = {}) {
    if (undefined === type)
      throw new Error('A model must have a `type` string.')

    if (undefined === schema)
      throw new Error('A model must have a `schema` object.')

    this.options = options;
    this.type = type;
    this.adapter = adapter;

    this.relationships = schema.relationships || {};
    this.attributes = schema.attributes || {};
  }

  /**
   * @ignore
   */
  static create() {
    return new Model(...arguments);
  }

  /**
   * This method retrieves records from the adapter that match the options
   * criteria.
   *
   * ```js
   * app.model('user').find({
   *   page: { offset: 20, limit: 40 },
   *   sort: { name: 'asc', age: 'desc' },
   *   fields: { password: false },
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
   * @param {Object} [options = {}] - Pagination, sorting, fields, and filters.
   * @return {Promise}
   */
  find(options = {}) {
    return this.adapter.find(this, options).then(data => {
      return Promise.resolve(ResourceArray.create(this, data))
    });
  }

  /**
   * This method retrieves a single resource from the adapter.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {String} id
   * @return {Promise}
   */
  findResource(id) {
    return this.adapter.findRecord(this, id).then(record => {
      return Promise.resolve(Resource.create(this, record));
    });
  }

  /**
   * This method retrieves a single resource from the adapter based on the options
   * criteria, i.e. this method is an alias for finding many resources and then
   * returning the first result.
   *
   * ```js
   * app.model('user').findOne({
   *   page: { offset: 20, limit: 40 },
   *   sort: { name: 'asc', age: 'desc' },
   *   fields: { password: false },
   *   filter: {
   *     age: { $gt: 20, $lte: 10 },
   *     name: { $in: [ 'Billy', 'Bob' ] },
   *     username: 'billybob',
   *   },
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {Object} [options = {}] - Pagination, sorting, fields, and filters.
   * @return {Promise}
   */
  findOne(options = {}) {
    return this.find(options).then(records => {
      if (undefined === records || undefined === records[0])
        return Promise.resolve(null);

      return Promise.resolve(Resource.create(this, records[0]));
    });
  }

  /**
   * This method retrieves either a single resource or many resources that are
   * related to a particular resource and meet the options criteria. For example,
   * this method can be used to return a resource defined by a to-one relationship.
   * This method can also be used to return a resource array defined by a to-many
   * relationship.
   *
   * ```js
   * // To-many relationship.
   * app.model('user').findRelated('123', 'pets', {
   *   page: { offset: 2, limit: 5 },
   *   sort: { species: 'asc', age: 'desc' },
   *   filter: {
   *     color: { $in: [ 'Black', 'White' ] },
   *   },
   * }).then(user => {
   *   // ResourceArray
   * });
   *
   * // To-one relationship.
   * app.model('user').findRelated('123', 'company').then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {String} id - The ID of the parent resource.
   * @param {String} field - The relationship name, i.e. 'pets'.
   * @param {Object} [options = {}] - Pagination, sorting, fields, and filters.
   * @return {Promise}
   */
  findRelated(id, field, options = {}) {
    if (!(field in this.relationships))
      return Promise.resolve(null);

    const model = this.relationships[field].model;
    const type = model.type;

    return this.findResource(id).then(resource => {
      const relationship = resource.relationship(field);
      const { isMany, model, child } = relationship;

      if (!isMany)
        return resource.get(field);

      const ids = child instanceof ResourceArray
        ? child.resources.map(resource => resource.id)
        : child;

      Object.assign(options, { ids });

      return model.find(options);
    }).then(related => {
      return Promise.resolve(related)
    });
  }

  /**
   * This method creates a resource and persists it in the adapter.
   *
   * ```js
   * app.model('user').create({
   *   name: 'Bobby',
   *   email: 'bobby@gmail.com',
   *   password: 'ilikecheese',
   *   pets: [ '123', '456' ],
   *   company: '789',
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {Object} body - Flattened json of attributes and relationships.
   * @return {Promise}
   */
  create(body) {
    return this.adapter.create(this, body).then(data => {
      return Promise.resolve(Resource.create(this, data));
    });
  }

  /**
   * This method updates a resource and persists it in the adapter.
   *
   * ```js
   * app.model('user').update({
   *   name: 'Jimmy',
   *   pets: [ '123' ],
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {String} id - The ID of the resource to be updated.
   * @param {Object} update - Flattened json of attributes and relationships.
   * @return {Promise}
   */
  update(id, update) {
    return this.adapter.update(this, id, update).then(data => {
      return Promise.resolve(Resource.create(this, data));
    });
  }

  /**
   * This method deletes a resource.
   *
   * ```js
   * app.model('user').delete('123').then(success => {
   *   // Boolean
   * });
   * ```
   *
   * @param {String} id - The ID of the resource to be deleted.
   * @return {Promise}
   */
  delete(id) {
    return this.adapter.delete(this, id);
  }
}
