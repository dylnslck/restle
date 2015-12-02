import Resource from '../resource';
import ResourceArray from '../resource-array';
import inflect from 'i';
import _ from 'lodash';

import { RelationshipError } from 'restle-error';

export default class Relationship {
  constructor(parent, child, options = {}) {
    if (undefined === parent)
      throw new Error('The `parent` argument is required for creating a relationship');

    if (!parent instanceof Resource) {
      throw new TypeError('The `parent` argument must be of type `Resource`');
    }

    this.parent = parent;
    this.child = child;

    Object.assign(this, {
      model: options.model,
      field: options.field,
      isMany: options.isMany,
      type: options.type,
    });
  }

  static create() {
    return new Relationship(...arguments);
  }

  set(target) {
    if (undefined === target)
      return Promise.reject(new TypeError('Cannot set a relationship with undefined.'));

    const { parent, child, isMany, field, type, model } = this;

    // to-one
    if (target instanceof Resource) {
      if (isMany) {
        return Promise.reject(new RelationshipError({
          type: 'to-many', method: 'set', target: 'resource'
        }));
      }

      this.child = target;
      return parent.update({
        [field]: target.id,
      });
    }

    // to-many
    if (target instanceof ResourceArray) {
      if (!isMany) {
        return Promise.reject(new RelationshipError({
          type: 'to-one', method: 'set', target: 'resource array'
        }));
      }

      this.child = target;
      return parent.update({
        [field]: target.resources.map(resource => resource.id),
      });
    }

    if (Array.isArray(target) && !isMany) {
      return Promise.reject(new RelationshipError({
        type: 'to-one', method: 'set', target: 'array'
      }));
    } else if (!Array.isArray(target) && isMany) {
      return Promise.reject(new RelationshipError({
        type: 'to-many', method: 'set', target: 'single value'
      }));
    }

    // array
    if (Array.isArray(target)) {
      return new Promise((resolve, reject) => {
        model.find({ ids: target })
          .then(resources => {
            this.child = resources;
            return parent.update({ [field]: target });
          })
          .then(resource => resolve(resource))
          .catch(err => reject(err));
      });
    }

    // id
    return new Promise((resolve, reject) => {
      model.findResource(target)
        .then(resource => {
          this.child = resource;
          return parent.update({ [field]: target });
        })
        .then(resource => resolve(resource))
        .catch(err => reject(err));
    });
  }

  append(target) {
    if (undefined === target)
      return Promise.reject(new TypeError('Cannot set a relationship with undefined.'));

    if (!this.isMany)
      return Promise.reject(new RelationshipError({ type: 'to-one', method: 'append', target: 'value' }));

    const { parent, field } = this;

    if (!this.child.resources)
      this.child.resources = [];

    const ids = this.child.resources.map(resource => resource.id);

    if (target instanceof Resource) {
      ids.push(target.id);
      this.child.resources.push(target);

      return parent.update({ [field]: ids });
    }

    if (target instanceof ResourceArray) {
      for (let resource of target.resources) {
        ids.push(resource.id);
        this.child.resources.push(resource);
      }

      return parent.update({ [field]: ids });
    }

    if (Array.isArray(target)) {
      ids.push(...target);
    } else {
      ids.push(target);
    }

    return this.set(Array.isArray(target) ? target : [ target ]);
  }

  delete(target) {
    const { isMany, field, parent } = this;

    if (undefined === target) {
      return isMany
        ? parent.update({ [field]: [] })
        : parent.update({ [field]: null });
    }

    if (target instanceof ResourceArray) {
      const ids = this.child.resources.filter(resource => {
        return target.indexOf(resource.id) >= 0;
      });

      return parent.update({ [field] : ids });
    }

    // FIXME: edge cases and errors
  }

  serialize(options = {}) {
    const { isMany, parent, child, field } = this;
    const namespace = undefined !== options.namespace
      ? `/${options.namespace}`
      : ``;

    const i = inflect();

    let serialized = {
      links: {
        self: `${namespace}/${i.pluralize(parent.type)}/${parent.id}/relationships/${field}`,
        related: `${namespace}/${i.pluralize(parent.type)}/${parent.id}/${field}`,
      },
    };

    if (child instanceof ResourceArray) {
      serialized.data = child.resources.map(resource => {
        return { type: resource.type, id: `${resource.id}` };
      });

      return serialized;
    }

    if (child instanceof Resource) {
      serialized.data = {
        type: child.type,
        id: `${child.id}`,
      };

      return serialized;
    }

    serialized.data = isMany ? [] : null;
    return serialized;
  }
}
