import Promise from 'bluebird';
import { NotFoundError } from 'restle-error';
import _ from 'lodash';

import checkFilters from './helpers/check-filters';
import checkIds from './helpers/check-ids';
import applySort from './helpers/apply-sort';
import applyFields from './helpers/apply-fields';

/**
 * The Adapter class is the interface between the persistence layer and Restle.
 * Adapter's responsibility is to retrieve basic json from the persistence layer,
 * and sideload relationships. The retrieved json must have a primary key.
 *
 * ```js
 * // stored in persistence layer
 * {
 *   id: 1,
 *   name: 'Jimmy John',
 *   pets: [ 1, 2 ],
 *   company: 4
 * }
 *
 * // the adapter needs to return
 * {
 *   id: 1,
 *   name: 'Jimmy John',
 *   pets: [{
 *     id: 1,
 *     name: 'Spot'
 *   }, {
 *     id: 2,
 *     name: 'Lucy'
 *   }],
 *   company: { id: 5, industry: 'electronics' }
 * }
 * ```
 *
 * Restle will provide the necessary methods with a Restle.Model class, which
 * includes all attribute and relationship information necessary for properly
 * sideloading records.
 *
 * Currently required methods: find, populate, retrieve, findRecord, create, update, delete.
 * TODO: establish required methods, eliminate lodash dependency, standardize error http codes
 *
 * @class
 */
export default class Adapter {
  constructor() {
    this.store = {};
  }

  /**
   * Connect to the persistence layer.
   *
   * @return {Promise}
   */
  connect() {
    return Promise.resolve(true);
  }

  /**
   * Disconnect from the persistence layer.
   *
   * @return {Promise}
   */
  disconnect() {
    return Promise.resolve(true);
  }

  /**
   * This method populates a record with sideloaded relationships.
   *
   * @param {Model} model
   * @param {Object} data
   * @return {Object}
   */
  populate(model, data) {
    // TODO: throw error if can't find resource with id, otherwise serializer breaks
    const { relationships } = model;
    const record = _.clone(data);
    let relatedAdapter, relatedModel;

    for (let field in record) {
      if (!(field in relationships))
        continue;

      relatedModel = relationships[field].model;
      relatedAdapter = relatedModel.adapter;
      record[field] = relatedAdapter.retrieve(relatedModel, record[field]);
    }

    return new Promise(resolve => {
      Promise.props(record).then(resolved => resolve(resolved));
    });
  }

  /**
   * This method retrieves many records from the persistence layer. The method
   * must perform necessary pagination, filtering, inclusion, and sparse fieldsets
   * as defined by the JSON API spec (www.jsonapi.org).
   *
   * This method must return an array of sideloaded JSON records, and the array
   * must have a 'count' property indicating the total number of records before
   * pagination.
   *
   * @param {Model} Model
   * @param {Object} query
   * @return {Promise}
   */

  find(model, options = {}) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    const type = model.type;
    const store = this.store[type] || [];

    // filters
    let records = _.clone(store, true).filter(record => {
      if ('ids' in options)
        if (!checkIds(options.ids, record))
          return false;

      if ('filter' in options)
        if (!checkFilters(options.filter, record))
          return false;

      return true;
    });

    // paginate
    const { length: count } = records;

    if ('page' in options) {
      const { offset, limit } = options.page;

      records = records.slice(
        (offset || 0),
        (offset || 0) + (limit || count)
      );
    }

    // sort and fields
    if ('sort' in options)
      applySort(options.sort, records);

    if ('fields' in options)
      applyFields(options.fields, records);

    // populate results
    const results = records.map(
      record => this.populate(model, record)
    );

    return new Promise(resolve => {
      Promise.all(results).then(resolved => {
        resolved.count = count;
        return resolve(resolved);
      });
    });
  }

  /**
   * This method retrieves pure records from the persistence layer with matching
   * ids as 'ids'.
   *
   */
  retrieve(model, ids) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    if (undefined === ids)
      return Promise.resolve(this.store[model.type] || []);

    const isMany = Array.isArray(ids);

    // ensure ids is an array
    ids = isMany ? ids : [ ids ];

    // map to ids to numbers
    ids = ids.map(id => Number(id));

    // retrieve records
    const type = model.type;
    const store = this.store[type] || [];
    const records = store.filter(record => checkIds(ids, record));

    return Promise.resolve(isMany ? records : records[0]);
  }

  /**
   * This method retrieves a single record from the persistence layer.
   *
   * @param {Model} Model
   * @param {String} id
   * @return {Promise}
   */
  findRecord(model, id) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    const type = model.type;
    const record = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (undefined === record)
      return Promise.reject(new NotFoundError({ type, id }));

    return Promise.resolve(this.populate(model, record));
  }

  /**
   * This method creates a record on the persistence layer. This method's
   * responsibility is to add the record then return the sideloaded json.
   *
   * @param {Model} Model
   * @param {Object} data
   * @return {Promise}
   */
  create(model, data) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    const type = model.type;

    // initialize the record store
    if (!(type in this.store))
      this.store[type] = [];

    // increment the id
    let length = this.store[type].length;
    data.id = ++length;

    // create the resource
    this.store[type].push(data);

    return new Promise(resolve => {
      this.populate(model, data).then(record => {
        return resolve(record);
      });
    });
  }

  update(model, id, update) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    const type = model.type;

    if (!(type in this.store))
      return Promise.resolve(false);

    const store = this.store[type];
    let record = _.find(store, { id: Number(id) });

    // reject if resource not found
    if (undefined === record)
      return Promise.reject(new NotFoundError({ type, id }));

    // update the store
    store.splice(
      --id, 1, Object.assign(record, update)
    );

    return new Promise(resolve => {
      this.populate(model, record).then(resolved => {
        return resolve(resolved);
      });
    });
  }

  delete(model, id) {
    if (undefined === model)
      throw new TypeError(`Model cannot be undefined.`);

    if (undefined === model.type)
      throw new TypeError(`Model type cannot be undefined.`);

    const type = model.type;

    if (!(type in this.store))
      return Promise.resolve(false);

    const store = this.store[type];
    let resource = _.find(store, { id: Number(id) });

    // reject if resource not found
    if (undefined === resource)
      return Promise.reject(new NotFoundError({ type, id }));

    // remove resource with matching id
    _.remove(this.store[type], resource => Number(resource.id) === Number(id));

    return Promise.resolve(true);
  }
}
