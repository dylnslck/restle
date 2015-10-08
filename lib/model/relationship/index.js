import Resource from '../resource';
import ResourceArray from '../resource-array';
import inflect from 'i';
import _ from 'lodash';

export default class Relationship {
  constructor(parent, child, options = {}) {
    if (!parent) {
      throw new Error('The `parent` argument is required for creating a relationship');
    }

    if (!parent instanceof Resource) {
      throw new TypeError('The `parent` argument must be of type `Resource`');
    }

    // set up parent and child
    this.parent = parent;
    this.child = child;

    // set up options
    this.model = options.model;
    this.field = options.field;
    this.isMany = options.isMany;
    this.namespace = parent.namespace || '';
  }

  static create() {
    return new Relationship(...arguments);
  }

  self() {
    const { namespace, parent, field } = this;
    const i = inflect();
    const id = parent.id;
    const type = parent.model.type;

    return `${namespace}/${i.pluralize(type)}/${id}/relationships/${field}`;
  }

  related() {
    const { namespace, parent, field } = this;
    const i = inflect();
    const id = parent.id;
    const type = parent.model.type;

    return `${namespace}/${i.pluralize(type)}/${id}/${field}`;
  }

  // TODO append resource array
  append(resourceArray) {
    if (!this.isMany) {
      throw new Error('Cannot append to-one relationships');
    }

    if (_.isEmpty(this.child)) {
      this.child = resourceArray;
      return;
    }

    return this.child.append(resourceArray);
  }

  replace(resourceArray) {
    if (!this.isMany) {
      throw new Error('Cannot replace to-one relationships, use `set` instead');
    }

    return this.child.replace(resourceArray);
  }

  // remove all from to-many
  removeAll() {
    if (!this.isMany) {
      throw new Error('Cannot delete to-one relationships, you must use `remove`');
    }

    const adapter = this.parent.model.adapter;
    const id = this.parent.id;
    const field = this.field;

    return new Promise((resolve, reject) => {
      adapter.deleteRelationship(this.parent.model, id, field)
        .then(success => {
          this.child.removeAll();
          return resolve(true);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  // remove from to-many relationship
  removeMany(resourceArray) {
    if (!this.isMany) {
      throw new Error('Cannot delete to-one relationships, you must use `remove`');
    }

    return this.child.removeMany(resourceArray);
  }

  // remove to-one relationship
  remove() {
    if (this.isMany) {
      throw new Error('Cannot remove to-many relationships.');
    }

    return this.child.remove();
  }

  // set to-one relationship
  set(resource) {
    if (this.isMany) {
      throw new Error('Cannot set to-many relationships');
    }

    const adapter = this.parent.model.adapter;
    const id = this.parent.id;
    const field = this.field;

    this.child = resource;
    return adapter.setRelationship(this.parent.model, id, field, resource.id);
  }

  serialize() {
    const self = this.self();
    const related = this.related();
    const { isMany, parent, child } = this;

    let serialized = {
      links: {
        self, related,
      },
    };

    if (child instanceof ResourceArray) {
      serialized.data = _.map(child.resources, resource => {
        return { type: resource.type, id: `${resource.id}` };
      });
    } else if (child instanceof Resource) {
      serialized.data = {
        type: child.type,
        id: `${child.id}`,
      };
    } else {
      serialized.data = isMany ? [] : null;
    }

    return serialized;
  }
}
