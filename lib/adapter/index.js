import Promise from 'bluebird';
import _ from 'lodash';

export default class Adapter {
  constructor(options) {
    this.store = {};
  }

  connect() {
    return new Promise.resolve(true);
  }

  disconnect() {
    return new Promise.resolve(true);
  }

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

  find(model, query = {}) {
    const type = model.type;
    let resources = this.store[type];

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

    return new Promise.resolve(_.map(resources, resource => this.populate(model, resource)));
  }

  findResource(model, id) {
    const type = model.type;
    const record = _.find(this.store[type], { id: Number(id) });

    if (!record) {
      return new Promise.reject('Resource not found');
    }

    // populate
    const resource = this.populate(model, record);

    return new Promise.resolve(resource);
  }

  findRelated(model, id, field, query = {}) {
    const type = model.type;

    return new Promise(resolve => {
      this.findResource(model, id, query).then(resource => {
        let relationship = resource[field];
        const relatedModel = model.relationships[field].model;

        // TODO: pagination method, different pagination schemes, and error pointing
        if (_.isArray(relationship) && query.page) {
          const { offset, limit } = query.page;
          resources = resources.slice(offset || 0, (offset || 0) + limit);
        }

        return resolve(this.populate(relatedModel, relationship));
      });
    });
  }

  findRelationship(model, id, field, query = {}) {
    return new Promise(resolve => {
      this.findResource(model, id, query).then(resource => {
        const relationship = resource[field];

        return resolve(relationship);
      });
    });
  }

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

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    // update the store
    this.store[type].splice(--id, 1, _.merge(resource, update));

    return new Promise.resolve(true);
  }

  deleteResource(model, id) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    _.remove(this.store[type], resource => {
      return Number(resource.id) === Number(id);
    });

    return new Promise.resolve(true);
  }

  // update to-one relationship
  setRelationship(model, id, field, relationship) {
    const type = model.type;

    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    resource[field] = Number(relationship);

    return Promise.resolve(true);
  }

  // remove to-one relationship
  removeRelationship(model, id, field) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    resource[field] = null;

    return Promise.resolve(true);
  }

  // TODO: relationships always an array?
  appendRelationship(model, id, field, relationships) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    // append ids then populate
    resource[field] = resource[field].concat(relationships);

    return new Promise.resolve(true);
  }

  // TODO: relationships always an array?
  deleteRelationship(model, id, field, relationships = []) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

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

  // TODO: relationships always an array?
  replaceRelationship(model, id, field, relationships) {
    const type = model.type;
    let resource = _.find(this.store[type], { id: Number(id) });

    if (!resource) {
      return Promise.reject('Resource not found');
    }

    resource[field] = _.map(relationships, relationship => Number(relationship));

    return new Promise.resolve(true);
  }

  deleteAll() {
    this.store = {};
    return new Promise.resolve(true);
  }
}
