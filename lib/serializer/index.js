// dependencies
import _ from 'lodash';
import inflect from 'i';

// serializer utilities
import baseUrl from './utils/base-url';

// general utilities
import parseModelName from '../utils/parse-model-name';

export default class Serializer {
  constructor(options = {}) {
    // setup the options
    this.origin = options.origin || 'http://localhost';;
    this.port = options.port || 3000;
    this.namespace = options.namespace || '/';
  }

  serializeResponse(router, method, type, documents) {
    const fields = router.fields;
    const i = inflect();
    const isMany = _.isArray(documents);
    const modelName = parseModelName(type);

    let endpoint;
    let response = {};

    if (isMany) {
      endpoint = baseUrl(this.origin, this.port, this.namespace, modelName);
      response.data = [];

      _.each(documents, document => {
        let id = document._id;
        let resource = {
          links: {
            self: baseUrl(router.origin, router.port, router.namespace, type, id),
          },
          id: id,
          type: modelName,
        };

        _.forOwn(document, (value, field) => {
          let isAttribute = fields[modelName].attributes[field];
          let isRelationship = fields[modelName].relationships[field];
          let isRelationshipMany = isRelationship && isRelationship.isMany;
          let fieldType = isRelationship && isRelationship.type;

          if (isAttribute) {
            if (!resource.attributes) {
              resource.attributes = {};
            }

            resource.attributes[field] = document[field];
          } else if (isRelationship) {
            let relationship = document[field];
            let relationshipAttributes = {};
            let relationshipRelationships = {};
            let relationshipType = fields[modelName].relationships[field].type;

            if (!resource.relationships) {
              resource.relationships = {};
            }

            if (!response.included) {
              response.included = [];
            }

            resource.relationships[field] = {
              links: {
                self: `${router.origin}:${router.port}${router.namespace}/${i.pluralize(type)}/${id}/relationships/${field}`,
                related: `${router.origin}:${router.port}${router.namespace}/${i.pluralize(type)}/${id}/${field}`,
              },
            };

            if (isRelationshipMany) {
              resource.relationships[field].data = [];

              _.each(relationship, relation => {
                resource.relationships[field].data.push({
                  type: relationshipType,
                  id: relation._id,
                });

                if (!_.find(response.included, { id: relation._id })) {
                  _.forOwn(relation, (relationValue, relationField) => {
                    if (fields[relationshipType].relationships[relationField]) {
                      relationshipRelationships[relationField] = relationValue;
                    } else if (fields[relationshipType].attributes[relationField]) {
                      relationshipAttributes[relationField] = relationValue;
                    }
                  });

                  response.included.push({
                    type: relationshipType,
                    id: relation._id,
                    links: {
                      self: baseUrl(router.origin, router.port, router.namespace, fields[modelName].relationships[field].type, relation._id),
                    },
                    attributes: relationshipAttributes,
                    relationships: relationshipRelationships,
                  });
                }
              });
            } else {
              resource.relationships[field].data = {
                type: relationshipType,
                id: relationship._id,
              };
            }
          }
        });

        response.data.push(resource);
      });
    } else {
      let document = documents;
      let id = document._id;
      let resource = {};
      endpoint = baseUrl(this.origin, this.port, this.namespace, modelName, id);
      response.data = {};
      resource.type = modelName;
      resource.id = id;

      _.forOwn(document, (value, field) => {
        let isAttribute = fields[modelName].attributes[field];
        let isRelationship = fields[modelName].relationships[field];
        let isRelationshipMany = isRelationship && isRelationship.isMany;
        let fieldType = isRelationship && isRelationship.type;

        if (isAttribute) {
          if (!resource.attributes) {
            resource.attributes = {};
          }

          resource.attributes[field] = document[field];
        } else if (isRelationship) {
          let relationship = document[field];
          let relationshipAttributes = {};
          let relationshipRelationships = {};
          let relationshipType = fields[modelName].relationships[field].type;

          if (!resource.relationships) {
            resource.relationships = {};
          }

          if (!response.included) {
            response.included = [];
          }

          resource.relationships[field] = {
            links: {
              self: `${router.origin}:${router.port}${router.namespace}/${i.pluralize(type)}/${id}/relationships/${field}`,
              related: `${router.origin}:${router.port}${router.namespace}/${i.pluralize(type)}/${id}/${field}`,
            },
          };

          if (isRelationshipMany) {
            resource.relationships[field].data = [];

            _.each(relationship, relation => {
              resource.relationships[field].data.push({
                type: relationshipType,
                id: relation._id,
              });

              if (!_.find(response.included, { id: relation._id })) {
                _.forOwn(relation, (relationValue, relationField) => {
                  if (fields[relationshipType].relationships[relationField]) {
                    relationshipRelationships[relationField] = relationValue;
                  } else if (fields[relationshipType].attributes[relationField]) {
                    relationshipAttributes[relationField] = relationValue;
                  }
                });

                response.included.push({
                  type: relationshipType,
                  id: relation._id,
                  links: {
                    self: baseUrl(router.origin, router.port, router.namespace, fields[modelName].relationships[field].type, relation._id),
                  },
                  attributes: relationshipAttributes,
                  relationships: relationshipRelationships,
                });
              }
            });
          } else {
            resource.relationships[field].data = {
              type: relationshipType,
              id: relationship._id,
            };
          }
        }
      });

      response.data = resource;
    }

    if (method === 'post' || method == 'patch') {
      response.data.links = { self: endpoint };
    } else {
      response.links = { self: endpoint };
    }

    return response;
  }

  serializeRelationship(router, type, name, relationship) {
    let serialized;
    const i = inflect();
    const fields = router.fields[parseModelName(type)];

    if (_.isArray(relationship)) {
      serialized = [];
      _.each(relationship, relation => {
        let type = fields.relationships[name].type;
        serialized.push({
          type: type,
          id: relation._id,
        });
      });
    } else {
      if (!_.keys(relationship).length) {
        serialized = null;
      } else {
        let type = fields.relationships[name].type;
        serialized = {};
        serialized.type = type;
        serialized.id = resource._id;
      }
    }

    return serialized;
  }

  /**
   * This method parses a JSON API request and produces a simple JSON that
   * mongoose can digest.
   *
   * ```js
   * // a request that looks like
   * {
   *   data: {
   *     attributes: {
   *       name: 'Bob'
   *     },
   *     relationships: {
   *       pets: {
   *         data: [{
   *           type: 'animal',
   *           id: 1
   *         }, {
   *           type: 'animal',
   *           id: 2
   *         }]
   *       }
   *     }
   *   }
   * }
   *
   * // will serialize into
   * {
   *   name: 'Bob',
   *   pets: [1, 2]
   * }
   * ```
   *
   * TODO: use an error handler
   *
   * @param {Object} body
   * @return {Object}
   */
  serializeRequest(body) {
    if (!body) {
      return {
        errors: [{
          status: 400,
          title: 'Missing request body',
          detail: 'A valid JSON is required in the request body for POST and PATCH commands.',
        }],
      };
    }

    if (!body.data) {
      return {
        errors: [{
          status: 400,
          title: 'Missing data member',
          detail: 'The primary data member is required for POST and PATCH commands.',
        }],
      };
    }

    if (!body.data.type) {
      return {
        errors: [{
          status: 400,
          title: 'Missing primary data type member',
          detail: 'The primary data type member is required for POST and PATCH commands.',
        }],
      };
    }

    const data = body.data;
    const serialized = {};

    // collect attributes
    _.each(_.keys(data.attributes), attribute => {
      serialized[attribute] = data.attributes[attribute];
    });

    // collect relationships
    _.each(_.keys(data.relationships), relationship => {
      const relationshipData = data.relationships[relationship].data;

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

  serializeResourceObject(fields, type, doc, many) {
    if (!doc) {
      throw new Error('Cannot serialize an undefined object!');
    }

    // FIXME: create global inflect so not to call the constructor every time
    const i = inflect();
    const id = doc._id;

    if (!fields) {
      throw new Error('Trying to serialize before fields have been established.');
    }

    if (!id) {
      throw new Error('Cannot serialize document with undefined id.');
    }

    // TODO: create method for building a resource object URL
    const resourceObject = {
      data: {
        type: i.singularize(type),
        id: id,
      },
    };

    if (many) {
      resourceObject.data.links = {};
      resourceObject.data.links.self = `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${id}`;
    }

    _.forOwn(doc, (value, key) => {
      if (fields.attributes[key]) {
        if (!resourceObject.data.attributes) {
          resourceObject.data.attributes = {};
        }

        resourceObject.data.attributes[key] = value;
      } else if (fields.relationships[key] && value.length) {
        if (!resourceObject.data.relationships) {
          resourceObject.data.relationships = {};
        }

        resourceObject.data.relationships[key] = {
          links: {
            self: `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${id}/relationships/${key}`,
            related: `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${id}/${key}`,
          },
        };

        if (_.isArray(value)) {
          resourceObject.data.relationships[key].data = [];

          _.each(value, individualValue => {
            resourceObject.data.relationships[key].data.push({
              type: fields.relationships[key].type,
              id: individualValue,
            });
          });
        } else {
          resourceObject.data.relationships[key].data = {};
          resourceObject.data.relationships[key].data.id = value;
          resourceObject.data.relationships[key].data.type = i.singularize(key);
        }
      }
    });

    return resourceObject;
  }
}
