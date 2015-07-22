import { EventEmitter } from 'events';

import db from './db';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import inflect from 'i';
import prettyjson from 'prettyjson';
import _ from 'lodash';

export default class Restle extends EventEmitter {
  constructor(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError(`Argument "options" must be an object.`);
    }

    if (!options.database) {
      throw new Error(`No argument database found in "options".`);
    }

    if (!options.port) {
      throw new Error(`No argument port found in "options".`);
    }

    super();

    const database = options.database;
    const port = options.port;
    const namespace = options.namespace || '/';
    const origin = options.origin || 'http://localhost';
    const app = express();
    const router = new express.Router();

    // express middleware
    app.use(bodyParser.json({ type: 'application/*+json' }));

    this.origin = origin;
    this.database = database;
    this.port = port;
    this.namespace = namespace;
    this.app = app;
    this.router = router;

    // configure routes
    this._setupRoutes();

    // initialize fields hash
    this._fields = {};

    // content type and accept error handling
    app.use((req, res, next) => {
      if (req.get('content-type') !== 'application/vnd.api+json') {
        return res.sendStatus(415);
      }

      // FIXME: is this the best place for this?
      res.set('content-type', 'application/vnd.api+json');
      next();
    });

    // connect to db
    db(this.database).then(() => {
      this.emit('ready');
    });

    // use the router
    app.use(this.namespace, this.router);

    // start express app
    this.server = app.listen(this.port);
  }

  disconnect() {
    this.server.close();
    mongoose.disconnect(() => {
      this.emit('disconnect');
    });
  }

  register(model, schema) {
    // TODO: needs refactoring
    const parsedSchema = this._parseSchema(schema);
    const i = inflect();
    const modelName = i.singularize(model.toLowerCase());

    // TODO: standardized method for serializing a model name
    const Model = mongoose.model(modelName, parsedSchema);

    // initialize private fields object if not already initialized
    if (!this._fields) {
      this._fields = {};
    }

    this._fields[modelName] = {};
    const fields = this._fields[modelName];
    fields.relationships = {};
    fields.attributes = {};
    let fieldType;

    // TODO: error checking for invalid attributes and relationships and duplicates
    _.each(_.keys(schema), (key) => {
      fieldType = schema[key];

      if (fieldType.attr) {
        fields.attributes[key] = { type: fieldType.attr };
      } else if (fieldType.hasMany) {
        fields.relationships[key] = { type: fieldType.hasMany, isMany: true };
      } else {
        fields.relationships[key] = { type: fieldType.belongsTo, isMany: false };
      }
    });

    this._setupRoutes(modelName, Model);
  }

  attr(type) {
    const types = {
      string: String,
      'boolean': Boolean,
      number: Number,
      date: Date,
    };

    return types[type];
  }

  hasMany(type) {
    return [{
      ref: type,
      type: mongoose.Schema.Types.ObjectId,
    }];
  }

  belongsTo(type) {
    return {
      ref: type,
      type: mongoose.Schema.Types.ObjectId,
    };
  }

  model(type) {
    const fields = this._fields;
    const i = inflect();
    const modelName = i.singularize(type.toLowerCase());

    if (!fields[modelName]) {
      return false;
    }

    return mongoose.model(modelName);
  }

  serialize(method, type, json) {
    let res = {};
    let baseUrl;
    const i = inflect();
    const fields = this._fields[i.singularize(type)];
    /**
     *  TODO: this should be a method and should work for any resource object
     *  or relationship
     */

    if (_.isArray(json)) {
      baseUrl = `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}`;
      res.data = [];

      _.each(json, doc => {
        res.data.push(this._serializeResourceObject(type, doc, true).data);
      });
    } else {
      baseUrl = `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${json._id}`;
      res = this._serializeResourceObject(type, json);
    }

    if (method === 'post' || method == 'patch') {
      res.data.links = { self: baseUrl };
    } else {
      res.links = { self: baseUrl };
    }

    return res;
  }

  _serializeResourceObject(type, doc, many) {
    if (!doc) {
      throw new Error('Cannot serialize an undefined object!');
    }

    // FIXME: create global inflect so not to call the constructor every time
    const i = inflect();
    const fields = this._fields[i.singularize(type)];
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

  _serializePostBody(body) {
    if (!body) {
      return {
        errors: [{
          status: 400,
          title: 'Missing request body',
          detail: 'A valid JSON is required in the request body for POST and PATCH commands.',
        }],
      };
    }

    const data = body.data;

    if (!data) {
      return {
        errors: [{
          status: 400,
          title: 'Missing data member',
          detail: 'The primary data member is required for POST and PATCH commands.',
        }],
      };
    }

    if (!data.type) {
      return {
        errors: [{
          status: 400,
          title: 'Missing primary data type member',
          detail: 'The primary data type member is required for POST and PATCH commands.',
        }],
      };
    }

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

  _isRegisteredModel(type) {
    return !!this._fields[type];
  }

  _parseSchema(schema) {
    const parsedSchema = {};
    let fieldType;
    let fieldValue;

    _.each(_.keys(schema), (key) => {
      fieldType = schema[key];

      // FIXME: dirty code
      if (fieldType.attr) {
        fieldValue = fieldType.attr;
        parsedSchema[key] = this.attr(fieldValue);
      } else if (fieldType.hasMany) {
        fieldValue = fieldType.hasMany;
        parsedSchema[key] = this.hasMany(fieldValue);
      } else {
        fieldValue = fieldType.belongsTo;
        parsedSchema[key] = this.belongsTo(fieldValue);
      }
    });

    return parsedSchema;
  }

  _serializeRelationship(modelName, name, relationship) {
    let serialized;
    const i = inflect();
    const fields = this._fields[i.singularize(modelName)];

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
        serialized.type = 'hello';
        serialized.id = resource._id;
      }
    }

    return serialized;
  }

  _setupRoutes() {
    const router = this.router;

    // TODO: modularize router and serializer
    router.route('/:type')
      .get((req, res) => {
        const type = req.params.type;
        const query = req.params.query;
        const Model = this.model(type);

        // FIXME: not sure if 404 is correct status
        if (!Model) {
          return res.sendStatus(404);
        }

        Model.find({}).populate('pets').lean().exec((err, resources) => {
          if (err) {
            return res.status(500).json(err);
          }
          res.json(this.serialize('get', type, resources));
        });
      })
      .post((req, res) => {
        const i = inflect();
        const type = req.params.type;
        const Model = this.model(type);
        const body = req.body;

        // FIXME: not sure if 404 is correct status
        if (!Model) {
          return res.sendStatus(404);
        }

        const serialized = this._serializePostBody(body);

        if (serialized.errors) {
          return res.status(serialized.errors[0].status).json(serialized);
        }

        if (i.singularize(body.data.type) !== i.singularize(type)) {
          return res.status(409).json({
            errors: [{
              status: 409,
              title: 'Type does not match endpoint',
              detail: 'The primary data type must match the endpoint when POSTING or PATCHING.',
            }],
          });
        }

        // TODO: make sure the type property matches the endpoint
        Model.create(serialized, (err, resource) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.set('location', `${this.origin}:${this.port}${this.namespace}/${i.pluralize(type)}/${resource._id}`);
          res.status(201).json(this.serialize('post', type, resource.toObject()));
        });
      });

    router.route('/:type/:id')
      .get((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const Model = this.model(type);

        // FIXME: not sure if 404 is correct status
        if (!Model) {
          return res.sendStatus(404);
        }

        Model.findById(id).lean().exec((err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING or GETTING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          if (!resource) {
            return res.status(404).json({
              errors: [{
                status: 404,
                title: 'Resource not found',
                detail: `Could not find the resource of type ${type} with id ${id}`,
              }],
            });
          }
          res.json(this.serialize('get', type, resource));
        });
      })
      .patch((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const body = req.body;
        const Model = this.model(type);
        const i = inflect();

        if (!Model) {
          return res.sendStatus(403);
        }

        if (i.singularize(body.data.type) !== i.singularize(type)) {
          return res.status(409).json({
            errors: [{
              status: 409,
              title: 'Type does not match endpoint',
              detail: 'The primary data type must match the endpoint when POSTING or PATCHING.',
            }],
          });
        }

        if (id !== body.data.id) {
          return res.status(409).json({
            errors: [{
              status: 409,
              title: 'Id does not match endpoint',
              detail: 'The primary data id must match the endpoint when PATCHING or DELETING.',
            }],
          });
        }

        const serialized = this._serializePostBody(body);

        Model.findByIdAndUpdate(id, serialized, (err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          if (!resource) {
            return res.status(404).json({
              errors: [{
                status: 404,
                title: 'Resource not found',
                detail: `Could not find the resource of type ${type} with id ${id}.`,
              }],
            });
          }

          return res.status(200).json(this.serialize('patch', type, resource.toObject()));
        });
      })
      .delete((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const Model = this.model(type);

        if (!Model) {
          return res.sendStatus(403);
        }

        Model.findByIdAndRemove(id, err => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          return res.sendStatus(204);
        });
      });

    router.route('/:type/:id/relationships/:field')
      .get((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const field = req.params.field;
        const Model = this.model(type);

        Model.findById(id).populate(field).lean().exec((err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          return res.status(200).json({
            links: {
              self: `${this.origin}:${this.port}${this.namespace}/${type}/${id}/relationships/${field}`,
              related: `${this.origin}:${this.port}${this.namespace}/${type}/${id}/${field}`,
            },
            data: this._serializeRelationship(type, field, resource[field]),
          });
        });
      })
      .post((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const field = req.params.field;
        const body = req.body;
        const Model = this.model(type);

        let update = {
          $push: {
            [field]: {
              $each: {},
            },
          },
        };

        if (!Model) {
          return res.sendStatus(403);
        }

        // TODO: 409 error
        update.$push[field].$each = _.map(body.data, relationship => {
          return relationship.id;
        });

        Model.findByIdAndUpdate(id, update, (err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          // TODO: send 200 if there is a computed property
          return res.sendStatus(204);
        });
      })
      .patch((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const field = req.params.field;
        const body = req.body;
        const Model = this.model(type);

        let update;

        if (!Model) {
          return res.sendStatus(403);
        }

        // TODO: 409 error

        if (_.isArray(body.data)) {
          if (_.isEmpty(body.data)) {
            update = { [field]: [] };
          } else {
            update = {};
            update.data = _.map(body, relationship => {
              return { [field]: relationship.data.id };
            });
          }
        } else {
          update = body.data ? { [field]: body.data.id } : { [field]: null };
        }

        Model.findByIdAndUpdate(id, update, (err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          // TODO: send 200 if there is a computed property
          return res.sendStatus(204);
        });
      })
      .delete((req, res) => {
        const type = req.params.type;
        const id = req.params.id;
        const field = req.params.field;
        const body = req.body;
        const Model = this.model(type);

        let update = {
          $pullAll: {
            [field]: {},
          },
        };

        if (!Model) {
          return res.sendStatus(403);
        }

        // TODO: 409 error
        update.$pullAll[field] = _.map(body.data, relationship => {
          return relationship.id;
        });

        Model.findByIdAndUpdate(id, update, (err, resource) => {
          if (err) {
            if (err.name === 'CastError' && err.type === 'ObjectId') {
              return res.status(403).json({
                errors: [{
                  status: 403,
                  title: 'Invalid resource id',
                  detail: 'A valid resource id is required when PATCHING or DELETING.',
                }],
              });
            }

            return res.sendStatus(500);
          }

          // TODO: send 200 if there is a computed property
          return res.sendStatus(204);
        });
      });
  }
}
