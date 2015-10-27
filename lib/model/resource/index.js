import Model from '../index';
import Relationship from '../relationship';
import ResourceArray from '../resource-array';
import Promise from 'bluebird';
import inflect from 'i';
import _ from 'lodash';

export default class Resource {
  constructor(model, data, options = {}) {
    if (!model) {
      throw Error('The `model` argument is required to create a resource');
    }

    if (!(model instanceof Model)) {
      throw new TypeError('The `model` argument must be an instance of `Model`')
    }

    if (!data) {
      throw new Error('The `data` argument is required to instantiate a resource');
    }

    this.namespace = options.namespace;
    this.options = options;
    this.related = options.related;

    this.model = model;
    this.type = model.type;
    this.attributes = {};
    this.relationships = {};

    this.id = data.id;

    const { attributes, relationships } = model;

    // build relationships
    _.forOwn(relationships, (value, relationship) => {
      const relationshipData = data[relationship];
      const relationshipModel = value.model;
      let child;

      /**
       * If relationshipData is an array, check to see if it's children have
       * an `id` key. If so, we know the data is sideloaded and can create a
       * ResourceArray.
       *
       * If relationshipData is not an array but has an `id` key, then we know
       * to create a Resource.
       *
       * Create a relationship with this (parent) and the generated child.
       *
       * TODO: clean up sloppy code
       */
      if(relationshipData) {
        if (_.isArray(relationshipData)) {
          if (relationshipData.length && relationshipData[0].id) {
            let newOptions = _.clone(options);
            delete newOptions.related;

            child = ResourceArray.create(relationshipModel, relationshipData, newOptions);
          } else {
            child = relationshipData;
          }
        } else {
          if (relationshipData.id) {
            let newOptions = _.clone(options);
            delete newOptions.related;

            child = Resource.create(relationshipModel, relationshipData, newOptions);
          } else {
            child = relationshipData;
          }
        }
      } else {
        if (value.isMany) {
          let newOptions = _.clone(options);
          delete newOptions.related;

          child = ResourceArray.create(relationshipModel, null, newOptions);
        } else {
          child = null;
        }
      }

      this.relationships[relationship] = Relationship.create(this, child, {
        model: value.model,
        field: relationship,
        type: value.type,
        isMany: value.isMany,
      });
    });

    // build attributes
    _.forOwn(attributes, (value, attribute) => {
      if (typeof data[attribute] === 'undefined' || typeof data[attribute] === 'null') return;

      const attributeValue = data[attribute];

      if (attributeValue) {
        this.attributes[attribute] = attributeValue;
        return;
      }
    });
  }

  static create() {
    return new Resource(...arguments);
  }

  link(type, id) {
    const namespace = this.namespace;
    const i = inflect();

    return `${namespace}/${i.pluralize(type)}/${id}`;
  }

  relationshipLink(relationship) {
    const { id, model, } = this;
    const namespace = this.namespace;
    const i = inflect();

    return `${namespace}/${i.pluralize(model.type)}/${id}/relationships/${relationship}`;
  }

  attribute(field) {
    return this.attributes[field] || null;
  }

  attributes(...fields) {
    const attributes = {};

    for (var field in fields) {
      attributes[field] = this.attribute(field);
    }

    return attributes;
  }

  relatedLink(relationship) {
    const { id, model, } = this;
    const namespace = this.namespace;
    const i = inflect();

    return `${namespace}/${i.pluralize(model.type)}/${id}/${relationship}`;
  }

  // FIXME: link('self')
  self() {
    const { id, model, namespace, } = this;
    const i = inflect();

    if (this.related) {
      return `${namespace}/${i.pluralize(this.related.type)}/${this.related.id}/${this.related.relationship}`;
    }

    return this.link(model.type, id);
  }

  relationship(field) {
    return this.relationships[field];
  }

  get(field) {
    const { attributes, relationships, options } = this;

    if (attributes[field]) return attributes[field];

    if(relationships[field]) {
      const { child, type, model } = relationships[field];

      return new Promise((resolve, reject) => {
        if (child instanceof ResourceArray) {
          return resolve(child);
        }

        if (child instanceof Resource) {
          return resolve(child);
        }

        // if the child is simply an id, retrieve it from the adapter and add
        // switch the child with the resolved resource
        if (_.isNumber(child)) {
          model.findResource(child)
            .then(resource => {
              this.relationships[field].child = resource;
              return resolve(resource);
            })
            .catch(err => {
              return reject(err);
            });
        } else {
          let find = _.map(child, id => model.findResource(id));

          Promise.all(find)
            .then(resources => {
              const resourceArray = this.relationships[field].child = ResourceArray.create(model, null, options);
              this.relationships[field].child.resources = resources;
              return resolve(resourceArray);
            })
            .catch(err => {
              return reject(err);
            })
        }
      });
    }

    return null;
  }

  serialize() {
    // every resource is identified by its `id` and `model`
    const { id, model, attributes, relationships, } = this;

    // clone attributes and relationships so they are not modified
    const type = model.type;
    const self = this.self();

    let serialized = {
      links: {
        self,
      },
      data: {
        type, id: `${id}`, attributes, relationships,
      },
      included: [],
    };

    // serialize relationships
    _.forOwn(model.relationships, (value, relationship) => {
      const rel = serialized.data.relationships[relationship];

      if (rel.child instanceof Resource) {
        if (!_.find(serialized.included, { id: rel.child.id, type: rel.child.type })) {
          serialized.included.push({
            type: rel.child.type,
            id: `${rel.child.id}`,
            attributes: rel.child.attributes,
            links: {
              self: rel.child.self(),
            },
          });
        }
      } else if (rel.child instanceof ResourceArray) {
        _.each(rel.child.resources, resource => {
          if (!_.find(serialized.included, { id: resource.id, type: resource.type })) {
            let childRelationships = {};

            _.forOwn(resource.relationships, (v, childRelationship) => {
              let child = v.child;
              let data;

              /**
               * FIXME: sometimes the child is a ResourceArray but it could
               * very well be a Resource - need to figure out the edge cases
               */
              if (child instanceof ResourceArray) {
                data = _.map(child.resources, c => {
                  return {
                    type: c.type,
                    id: c.id,
                  };
                });
              } else if (_.isArray(child)) {
                data = _.map(child, c => {
                  return {
                    type: v.model.type,
                    id: c,
                  };
                });
              } else {
                data = {
                  type: v.model.type,
                  id: child,
                };
              }

              childRelationships[childRelationship] = {
                data
              };
            });

            serialized.included.push({
              type: resource.type,
              id: `${resource.id}`,
              attributes: resource.attributes,
              relationships: childRelationships,
              links: {
                self: resource.self(),
              },
            });
          }
        });
      }

      serialized.data.relationships[relationship] = rel.serialize();
    });

    return serialized;
  }
}
