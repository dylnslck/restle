import Resource from './resource';
import ResourceArray from './resource-array';
import Relationship from './relationship';
import _ from 'lodash';

export default class Model {
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

  static create() {
    return new Model(...arguments);
  }

  find(options = {}) {
    return this.adapter.find(this, options).then(data => {
      return Promise.resolve(ResourceArray.create(this, data))
    });
  }

  findResource(id) {
    return this.adapter.findRecord(this, id).then(record => {
      return Promise.resolve(Resource.create(this, record));
    });
  }

  findOne(options = {}) {
    return this.find(options).then(records => {
      if (undefined === records || undefined === records[0])
        return Promise.resolve(null);

      return Promise.resolve(Resource.create(this, records[0]));
    });
  }

  findRelated(id, field, options = {}) {
    if (!(field in this.relationships))
      return Promise.resolve(null);

    const model = this.relationships[field].model;
    const type = model.type;

    return this.findResource(id).then(resource => {
      return resource.get(field);
    }).then(related => {
      return Promise.resolve(related)
    });
  }

  create(body) {
    return this.adapter.create(this, body).then(data => {
      return Promise.resolve(Resource.create(this, data));
    });
  }

  update(id, update) {
    return this.adapter.update(this, id, update).then(data => {
      return Promise.resolve(Resource.create(this, data));
    });
  }

  delete(id) {
    return this.adapter.delete(this, id);
  }

  serializeRequest(body) {
    const data = body.data;
    const serialized = {};

    // collect attributes
    _.each(_.keys(data.attributes), attribute => {
      serialized[attribute] = data.attributes[attribute];
    });

    // collect relationships
    _.forOwn(data.relationships, (value, relationship) => {
      const relationshipData = value.data;

      if (_.isEmpty(relationshipData) && _.isArray(relationshipData)) {
        serialized[relationship] = [];
        return;
      }

      if (_.isNull(relationshipData)) {
        serialized[relationship] = null;
        return;
      }

      if (_.isArray(relationshipData)) {
        serialized[relationship] = [];

        _.each(relationshipData, relation => {
          serialized[relationship].push(relation.id);
        });
      } else {
        serialized[relationship] = relationshipData.id;
      }
    });

    return serialized;
  }
}
