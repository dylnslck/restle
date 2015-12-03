import Model from '../index';
import Relationship from '../relationship';
import ResourceArray from '../resource-array';
import Promise from 'bluebird';
import inflect from 'i';
import _ from 'lodash';

import configureAttributes from './utils/configure-attributes';
import configureRelationships from './utils/configure-relationships';
import compoundDocument from './utils/compound-document';

export default class Resource {
  constructor(model, data) {
    if (undefined === model)
      throw Error('The `model` argument is required to create a resource');

    if (!(model instanceof Model))
      throw new TypeError('The `model` argument must be an instance of `Model`')

    if (undefined === data)
      throw new Error('The `data` argument is required to instantiate a resource');

    this.model = model;
    this.type = model.type;
    this.id = data.id;

    const { attributes, relationships } = model;

    this.attributes = {};
    Object.assign(this.attributes,
      configureAttributes(attributes, data));

    this.relationships = {};
    Object.assign(this.relationships,
      configureRelationships(this, relationships, data));
  }

  static create() {
    return new Resource(...arguments);
  }

  attribute(field) {
    return this.attributes[field];
  }

  attributes(...fields) {
    const attributes = {};

    for (let field in fields)
      attributes[field] = this.attribute(field);

    return attributes;
  }

  relationship(field) {
    return this.relationships[field];
  }

  get(field) {
    const { attributes, relationships } = this;

    if (field in attributes)
      return attributes[field];

    if (field in relationships) {
      const { child, type, model } = relationships[field];

      return new Promise((resolve, reject) => {
        if (child instanceof ResourceArray || child instanceof Resource)
          return resolve(child);

        if (Object.is(child, null))
          return resolve(null);

        const isMany = Array.isArray(child);

        const retrieve = isMany
          ? model.find({ ids: child })
          : model.findResource(child);

        retrieve.then(resolved => {
          this.relationships[field].child = resolved;
          return resolve(resolved);
        }).catch(err => reject(err));
      });
    }

    return null;
  }

  set(field, target) {
    const relationship = this.relationship(field);

    return relationship && relationship.set(target);
  }

  update(update) {
    return this.model.update(this.id, update);
  }

  delete() {
    return this.model.delete(this.id);
  }

  serialize(options = {}) {
    const { id, model, type } = this;

    const i = inflect();
    const pluralType = i.pluralize(type);
    const attributes = {};
    const relationships = {};
    const included = [];

    const namespace = undefined !== options.namespace
      ? `/${options.namespace}`
      : ``;

    Object.assign(attributes, this.attributes);

    for (let relationship in model.relationships) {
      const { isMany } = model.relationships[relationship];
      const child = this.relationships[relationship].child;

      if (!(relationship in this.relationships) ||
        (Array.isArray(child) && !child.length) ||
          (Object.is(child, null))) {

        const links = {
          self: `${namespace}/${pluralType}/${id}/relationships/${relationship}`,
          related: `${namespace}/${pluralType}/${id}/${relationship}`,
        };

        relationships[relationship] = isMany
          ? { links, data: [] }
          : { links, data: null };

        continue;
      }

      if (child instanceof Resource) {
        let isIncluded = undefined !== _.find(included, {
          id: `${child.id}`, type: child.type,
        });

        relationships[relationship] = {
          links: {
            self: `${namespace}/${pluralType}/${id}/relationships/${relationship}`,
            related: `${namespace}/${pluralType}/${id}/${relationship}`,
          },
          data: {
            id: `${child.id}`,
            type: child.type,
          },
        };

        if (!isIncluded)
          included.push(compoundDocument(child, { namespace }));

        continue;
      }

      if (child instanceof ResourceArray) {
        relationships[relationship] = {
          links: {
            self: `${namespace}/${pluralType}/${id}/relationships/${relationship}`,
            related: `${namespace}/${pluralType}/${id}/${relationship}`,
          },
          data: child.resources.map(resource => {
            return { id: `${resource.id}`, type: resource.type };
          }),
        };

        for (let r of child.resources) {
          let isIncluded = undefined !== _.find(included, {
            id: `${child.id}`, type: child.type,
          });

          if (!isIncluded)
            included.push(compoundDocument(r, { namespace }));
        }

        continue;
      }
    }

    return {
      links: { self: `${namespace}/${pluralType}/${id}` },
      data: {
        id: `${id}`,
        type,
        attributes,
        relationships,
      },
      included,
    };
  }
}
