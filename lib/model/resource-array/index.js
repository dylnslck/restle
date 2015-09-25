import Resource from '../resource';
import Model from '../index';
import inflect from 'i';
import _ from 'lodash';

export default class ResourceArray {
  constructor(model, data, options = {}) {
    if (!model) {
      throw Error('The `model` argument is required to create a resource array.');
    }

    if (!(model instanceof Model)) {
      throw new TypeError('The `model` argument must be an instance of `Model`.')
    }

    this.model = model;
    this.namespace = options.namespace;
    this.related = options.related;

    this.resources = data
      ? (_.map(data, resource => Resource.create(model, resource, options)))
      : [];
  }

  static create() {
    return new ResourceArray(...arguments);
  }

  append(resourceArray) {
    _.each(resourceArray, resource => this.resources.push(resource));
  }

  replace(resourceArray) {
    this.resources = resourceArray;
  }

  remove(id) {
    this.resources = _.remove(this.resources, resource => {
      return resource.id === id;
    });
  }

  removeAll() {
    this.resources = [];
  }

  self() {
    const { model, namespace, } = this;
    const i = inflect();

    if (this.related) {
      return `${namespace}/${i.pluralize(this.related.type)}/${this.related.id}/${this.related.relationship}`;
    }

    return `${namespace}/${i.pluralize(model.type)}`;
  }

  get(id, field) {
    return _.find(this.resources, { id }).get(field);
  }

  serialize() {
    const resources = this.resources;
    const self = this.self();

    const serialized = {
      links: { self, },
      data: [], included: [],
    };

    _.each(resources, resource => {
      const serializedResource = resource.serialize();
      const serializedIncluded = serializedResource.included;

      serialized.data.push(serializedResource.data);

      _.each(serializedIncluded, include => {
        const id = include.id;

        if (!_.find(serialized.included, { id })) {
          serialized.included.push(include);
        }
      });
    });

    return serialized;
  }
}
