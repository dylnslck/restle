import Promise from 'bluebird';
import _ from 'lodash';

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
    const relationships = model.relationships;
    let resource = _.clone(data);

    _.forOwn(resource, (value, field) => {
      if (!relationships[field]) return;
      const store = this.store[relationships[field].type];

      resource[field] = _.isArray(value)
        ? (_.map(value, id => id.id ? id : _.find(store, { id: Number(id) })))
        : (_.find(store, { id: value }));
    });

    return resource;
  }

  /**
   * This method translates schema defined filters into an appropriate query
   * language.
   *
   * ```js
   * // example filters:
   * filters: {
   *   'older-than': { attribute: 'age', operator: '>' },
   *   'younger-than': { attribute: 'age', operator: '<' },
   * }
   * ```
   *
   * @param {Model} model
   * @param {Object} filters
   * @return {Promise}
   */
  filter(model, filters) {
    const type = model.type;
    let resources = this.store[type];

    resources = _.filter(resources, resource => {
      let pass = true;

      _.forOwn(filters, (value, filter) => {
        if (!model.filters[filter]) return;

        const { attribute, operator } = model.filters[filter];

        switch (operator) {
          case '>':
            pass = resource[attribute] > value;
            break;
          case '<':
            pass = resource[attribute] < value;
            break;
          case '>=':
            pass = resource[attribute] >= value;
            break;
          case '<=':
            pass = resource[attribute] <= value;
            break;
          case '=':
            pass = resource[attribute] == value;
            break;
          default:
            pass = true;
        }

        if (!pass) return false;
      });

      return pass;
    });

    return Promise.resolve(_.map(resources, resource => this.populate(model, resource)));
  }

  /**
   * This method retrieves many records from the persistence layer. The method
   * must perform necessary pagination, filtering, inclusion, and sparse fieldsets
   * as defined by the JSON API spec (www.jsonapi.org).
   *
   * @param {Model} Model
   * @param {Object} query
   * @return {Promise}
   */
  find(model, ids = [], query = {}) {
    const type = model.type;
    let resources = this.store[type];

    if (query.ids) {
      delete query.ids;
    }

    // apply ids searching
    if (_.isArray(ids) && ids.length) {
      ids = _.map(ids, id => Number(id));
      resources = _.filter(resources, resource => _.indexOf(ids, Number(resource.id)) >= 0);
    }

    // pagination
    // TODO: pagination method, different pagination schemes, and error pointing
    if (query.page) {
      const { offset, limit } = query.page;
      resources = resources.slice(offset || 0, (offset || 0) + limit);
      delete query.page;
    }

    // sorting
    if (query.sort) {
      let order = [];

      // FIXME: sloppy as hell
      const sort = query.sort;
      const fields = _.map(sort.split(','), field => {
        if (field[0] === '-') {
          order.push('desc');
          field = field.replace('-', '');
        } else if (field[0] === '+') {
          order.push('asc');
          field = field.replace('+', '');
        } else {
          // asc is default
          order.push('asc');
        }

        return field;
      });

      resources = _.sortByOrder(resources, fields, order);
      delete query.sort;
    }

    // TODO: fields

    if (query.fields) {
      /*
      const fields = query.fields;

      resources = _.map(resources, resource => {
        const main = fields[type].split(',');

        _.forOwn(resource, (value, field) => {
          if (!_.indexOf(main, field)) {
            delete resource[field];
          }
        });

        return resource;
      });
      */
      delete query.fields;
    }

    // filtering
    if (query.filter) {
      // TODO: implement
      delete query.filter;
    }

    // querying
    if (query) {
      resources = _.filter(resources, resource => {
        let pass = true;

        _.forOwn(query, (value, field) => {
          if (resource[field] != value) {
            pass = false;
            return false;
          }
        });

        return pass;
      });
    }

    return Promise.resolve(_.map(resources, resource => this.populate(model, resource)));
  }

  /**
   * This method retrieves a single record from the persistence layer.
   *
   * @param {Model} Model
   * @param {String} id
   * @return {Promise}
   */
  findResource(model, id) {
    const type = model.type;
    const resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    return Promise.resolve(this.populate(model, resource));
  }

  /**
   * This method retrieves the records related to a primary object's relationship.
   * This method may retrieve many records or a single record depending on if the
   * relationship is to-one or to-many.
   *
   * @param {Model} Model
   * @param {String} id
   * @param {String} field
   * @param {Object} query
   * @return {Promise}
   */
  findRelated(model, id, field, query = {}) {
    const type = model.type;

    return new Promise(resolve => {
      this.findResource(model, id, query).then(resource => {
        if (!resource) return resolve(null);

        let relationship = resource[field];
        const relatedModel = model.relationships[field].model;

        // TODO: pagination method, different pagination schemes, and error pointing
        if (_.isArray(relationship) && query.page) {
          const { offset, limit } = query.page;
          resources = resources.slice(offset || 0, (offset || 0) + limit);
        }

        // TODO: all query related methods here
        return resolve(this.populate(relatedModel, relationship));
      });
    });
  }

  /**
   * This method retrieves relationship data from a resource.
   *
   * @param {Model} Model
   * @param {String} id
   * @param {String} field
   * @param {Object} query
   * @return {Promise}
   */
  findRelationship(model, id, field, query = {}) {
    return new Promise(resolve => {
      this.findResource(model, id, query).then(resource => resolve(resoure[field]));
    });
  }

  /**
   * This method creates a record on the persistence layer. This method's
   * responsibility is to add the record then return the sideloaded json.
   *
   * @param {Model} Model
   * @param {Object} data
   * @return {Promise}
   */
  createResource(model, data) {
    const type = model.type;

    // initialize the record store
    if (!this.store[type]) this.store[type] = [];

    // increment the id
    let length = this.store[type].length;
    data.id = ++length;

    // create the resource
    this.store[type].push(data);

    return Promise.resolve(this.populate(model, data));
  }

  updateResource(model, id, update) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    // update the store
    this.store[type].splice(--id, 1, _.merge(resource, update));

    return Promise.resolve(true);
  }

  deleteResource(model, id) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    // remove resource with matching id
    _.remove(this.store[type], resource => Number(resource.id) === Number(id));

    return Promise.resolve(true);
  }

  // update to-one relationship
  setRelationship(model, id, field, relationship) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    // update relationship field
    resource[field] = Number(relationship);

    return Promise.resolve(true);
  }

  // remove to-one relationship
  removeRelationship(model, id, field) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    // remove relationship field
    resource[field] = null;

    return Promise.resolve(true);
  }

  appendRelationship(model, id, field, relationships) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.resolve(null);

    // append ids
    resource[field] = resource[field].concat(relationships);

    return Promise.resolve(true);
  }

  deleteRelationship(model, id, field, relationships = []) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.reject(null);

    if (relationships.length) {
      // remove ids
      _.remove(resource[field], relationship => {
        return _.indexOf(relationships, relationship) >= 0;
      });
    } else {
      // remove all
      resource[field] = [];
    }

    return new Promise.resolve(true);
  }

  replaceRelationship(model, id, field, relationships) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    // reject if resource not found
    if (!resource) return Promise.reject(null);

    // replace relationships field with numerical ids
    resource[field] = _.map(relationships, relationship => Number(relationship));

    return new Promise.resolve(true);
  }
}
