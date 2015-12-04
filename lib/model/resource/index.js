import Model from '../index';
import Relationship from '../relationship';
import ResourceArray from '../resource-array';
import Promise from 'bluebird';
import inflect from 'i';
import _ from 'lodash';

import configureAttributes from './utils/configure-attributes';
import configureRelationships from './utils/configure-relationships';
import compoundDocument from './utils/compound-document';

/**
 * A resource is a representation of a real piece of data from the adapter.
 *
 * @class Resource
 */
export default class Resource {
  /**
   * @ignore
   */
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

  /**
   * @ignore
   */
  static create() {
    return new Resource(...arguments);
  }

  /**
   * Returns the value of a resource's attribute.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   const name = user.attribute('name'); // Billy
   * })
   * ```
   *
   * @param {String} field
   * @return {(Number|String|Date|Boolean)}
   */
  attribute(field) {
    return this.attributes[field];
  }

  /**
   * Returns an object of attributes.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   const { name, email } = user.attributes('name', 'email');
   * })
   * ```
   *
   * @param {...String} fields
   * @return {Object}
   */
  attributes(...fields) {
    const attributes = {};

    for (let field in fields)
      attributes[field] = this.attribute(field);

    return attributes;
  }

  /**
   * Returns a resource's relationship.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   const pets = user.relationship('pets'); // Relationship
   * })
   * ```
   *
   * @param {String} field
   * @return {Relationship}
   */
  relationship(field) {
    return this.relationships[field];
  }

  /**
   * Returns either an attribute, resource, or resource array that is related to
   * a resource.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   const name = user.get('name'); // Billy
   *   return user.get('pets');
   * }).then(pets => {
   *   // ResourceArray
   *   const spot = pets.resources[0]; // Resource
   *   return spot.get('treat');
   * }).then(treat => {
   *   // Resource
   *   const flavor = treat.get('flavor');
   * });
   *
   * @param {String} field
   * @return {(String|Number|Date|Boolean|Promise)}
   */
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

  /**
   * Sets a resource's relationship called `field` with `target`.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   return user.set('company', '123');
   * }).then(user => {
   *   // Resource
   * })
   *
   * @param {String} field
   * @return {(String|Number|Date|Boolean|Promise)}
   */
  set(field, target) {
    const relationship = this.relationship(field);

    return relationship && relationship.set(target);
  }

  /**
   * Updates a resource.
   *
   * ```js
   * app.model('user').findResource('123').then(user => {
   *   // Resource
   *   return user.update({
   *     name: 'Billy',
   *     pets: [ '424', '124' ],
   *     company: '12',
   *   });
   * }).then(user => {
   *   // Resource
   * });
   * ```
   *
   * @param {Object} update - Flattened json of relationships and attributes.
   * @return {Promise}
   */
  update(update) {
    return this.model.update(this.id, update);
  }

  /**
   * Deletes a resource.
   *
   * ```js
   * app.model('user').delete('123').then(success => {
   *   // Boolean
   * })
   * ```
   *
   * @return {Promise}
   */
  delete() {
    return this.model.delete(this.id);
  }

  /**
   * Serializes a resource.
   *
   * @private
   * @param {Object} [options={}]
   * @return {Object}
   */
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
