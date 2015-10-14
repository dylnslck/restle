// dependencies
import express from 'express';
import inflect from 'i';
import _ from 'lodash';

// classes
import Model from '../model';
import Resource from '../model/resource';

// router utilites
import isValidContentType from './utils/check-content-type';

// general utilites
import parseModelName from '../utils/parse-model-name';

export default class Router {
  constructor(options = {}) {
    // express router
    this.router = new express.Router();

    // instiantiate the model array
    this.models = {};

    // setup the options
    this.port = options.port || 3000;
    this.namespace = options.namespace || '';

    // pass in restle instance
    this.restle = options.restle;

    // creates the proper routes for resource objects and relationships
    this.setupRoutes();
  }

  /**
   * This method is an alias for `Restle.Model.model()`.
   *
   * @param {String} type
   * @return {Restle.Model}
   */
  model(type) {
    return this.restle.model(type);
  }

  /**
   * This method fetches all resources of type `req.params.type`, then
   * serializes the response JSON.
   *
   * @param {Object} req
   * @param {Object} res
   */
  find(req, res, next) {
    const { type } = req.params;
    const query = req.query;
    const model = this.model(type);

    if (!model) return res.sendStatus(404);

    const ids = query.ids || null;

    model.find(ids, query).then(resourceArray => {
      req.resourceArray = resourceArray;
      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method fetches a single resources of type `req.params.type`, then
   * serializes the response JSON.
   *
   * @param {Object} req
   * @param {Object} res
   */
  findResource(req, res, next) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (!model) return res.sendStatus(404);

    model.findResource(id).then(resource => {
      if (!resource) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      req.resource = resource;
      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  findRelated(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) return res.sendStatus(404);

    // TODO: resourceArray needs a better name, as it may be a Resource not ResourceArray
    model.findRelated(id, field).then(resourceArray => {
      return res.json(resourceArray.serialize());
    }).catch(err => {
      throw new Error(err);
    });
  }

  findRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) return res.sendStatus(404);

    model.findRelationship(id, field).then(relationship => {
      if (!relationship) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return res.json(relationship.serialize());
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method creates a single resources of type `req.params.type`, then
   * serializes the response JSON.
   *
   * @param {Object} req
   * @param {Object} res
   */
  createResource(req, res, next) {
    const body = req.body;

    if (!(body && body.data && body.data.type)) {
      return res.status(400).json({
        errors: [{
          status: 400,
          title: 'Missing primary data object or type key',
          detail: 'A primary data object with a matching type key is required for creating a resource.',
        }],
      });
    }

    const type = body.data.type;

    if (parseModelName(type) !== parseModelName(req.params.type)) {
      return res.status(409).json({
        errors: [{
          status: 409,
          title: 'Type key does not match endpoint',
          detail: 'The primary data type key must match the endpoint.',
        }],
      });
    }

    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.createResource(body).then(resource => {
      res.set('location', resource.self());
      res.status(201);
      req.resource = resource;
      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method updates a single resources of type `req.params.type`, then
   * sends a 204.
   *
   * TODO: send a 200 if any other properties outside the request context change
   *
   * @param {Object} req
   * @param {Object} res
   */

  updateResource(req, res, next) {
    const body = req.body;

    if (!(body && body.data && body.data.type)) {
      return res.sendStatus(400);
    }

    const { type, id } = req.params;

    if (id !== body.data.id) {
      return res.status(409).json({
        errors: [{
          status: 409,
          title: 'Payload id does not match endpoint',
          detail: `The payload id ${id} does not match the primary data id ${body.data.id}.`,
        }],
      });
    }

    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.updateResource(id, body).then(success => {
      if (!success) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method deletes a single resources of type `req.params.type` with an id
   * of `req.params.id`.
   *
   * @param {Object} req
   * @param {Object} res
   */
  deleteResource(req, res, next) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(403);
    }

    model.deleteResource(id).then(success => {
      if (!success) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method returns the appropriate relationship based on `req.params.type`
   * and `req.params.id` and `req.params.field`.
   *
   * @param {Object} req
   * @param {Object} res
   */
  findRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.findRelationship(id, field).then(relationship => {
      if (!relationship) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      req.relationship = relationship;
      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method appends a resource identifier object to a relationship array.
   *
   * @param {Object} req
   * @param {Object} res
   */
  appendRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    const ids = _.map(update.data, data => data.id);

    model.appendRelationship(id, field, ids).then(success => {
      if (!success) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return next();
    }).catch(err => {
      if (err === 'Cannot append to-one relationships') {
        return res.status(403).json({
          errors: [{
            status: 403,
            title: 'Cannot append to-one relationships',
            detail: 'You can only patch or delete a to-one relationship with a resource identifier object.',
          }],
        });
      }

      throw new Error(err);
    });
  }

  /**
   * This method performs a full-replacement of a relationship.
   *
   * @param {Object} req
   * @param {Object} res
   */
  updateRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.updateRelationship(id, field, update).then(success => {
      if (!success) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return next();
    }).catch(err => {
      return res.status(403).json({
        errors: [{
          status: 403,
          title: 'Cannot update to-one relationship with array',
          detail: 'You can only update a to-one relationship with a resource identifier object.',
        }],
      });
    });
  }

  /**
   * This method removes all the appropriate relationships from the resource
   * based on the request body.
   *
   * @param {Object} req
   * @param {Object} res
   */
  deleteRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    const ids = _.map(update.data, data => data.id);

    model.deleteRelationship(id, field, ids).then(success => {
      if (!success) {
        return res.status(404).json({
          errors: [{
            status: 404,
            title: 'Resource not found',
            detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
          }],
        });
      }

      return next();
    }).catch(err => {
      throw new Error(err);
    });
  }

  /**
   * This method creates the appropriate routes determined by the JSON API spec:
   *
   * ```js
   *   GET /:type
   *   POST /:type
   *
   *   GET /:type/:id
   *   PATCH /:type/:id
   *   DELETE /:type/:id
   *
   *   GET /:type/:id/relationships/:field
   *   POST /:type/:id/relationships/:field
   *   PATCH /:type/:id/relationships/:field
   *   DELETE /:type/:id/relationships/:field
   *
   *   GET /:type/:id/:field
   * ```
   *
   * This method also sets up the `before` and `after` events.
   * TODO: needs major refactoring
   *
   * @param {Object} req
   * @param {Object} res
   */
  setupRoutes() {
    const router = this.router;
    const manyResourcesEndpoint = `/:type`;
    const singleResourceEndpoint = `/:type/:id`;
    const relationshipEndpoint = `/:type/:id/relationships/:field`;
    const relatedEndpoint = `/:type/:id/:field`;

    // content type
    router.use((req, res, next) => {
      res.set('content-type', 'application/vnd.api+json');
      next();
    });

    // handle events
    router.all('*', (req, res, next) => {
      const event = 'before';
      const restle = this.restle;

      if (restle.listeners(event).length) {
        return restle.emit(event, req, res, next);
      }

      return next();
    });

    router.route(manyResourcesEndpoint)

    // handle before event
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const restle = this.restle;
      const event = `${modelName}.${method === 'get' ? 'find.before' : 'create.before'}`;

      if (restle.listeners(event).length) {
        return restle.emit(event, req, res, next);
      }

      return next();
    })

    // retrieve many resources
    .get((req, res, next) => {
      return this.find(req, res, next);
    })

    // create a resource
    .post((req, res, next) => {
      if (!isValidContentType(req)) {
        return res.sendStatus(415);
      }

      return this.createResource(req, res, next);
    })

    // handle after event
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const event = `${modelName}.${method === 'get' ? 'find.after' : 'create.after'}`;
      const restle = this.restle;
      const resourceArray = req.resourceArray || req.resource;

      if (restle.listeners(event).length) {
        return restle.emit(event, (req.resourceArray || req.resource), req, res, next);
      }

      return next();
    })

    // serialize response
    .all((req, res, next) => {
      return res.json(req.resourceArray
        ? req.resourceArray.serialize()
        : req.resource.serialize());
    });

    router.route(singleResourceEndpoint)

    // handle before event
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const restle = this.restle;

      const events = {
        get: `${modelName}.findOne.before`,
        patch: `${modelName}.update.before`,
        'delete': `${modelName}.delete.before`,
      };

      const event = events[method];

      if (restle.listeners(event).length) {
        return restle.emit(event, req, res, next);
      }

      return next();
    })

    // retreive a single resource
    .get((req, res, next) => {
      return this.findResource(req, res, next);
    })

    // update a single resource
    .patch((req, res, next) => {
      if (!isValidContentType(req)) {
        return res.sendStatus(415);
      }

      return this.updateResource(req, res, next);
    })

    // delete a single resource
    .delete((req, res, next) => {
      return this.deleteResource(req, res, next);
    })

    // handle after event
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const restle = this.restle;
      const resource = req.resource;

      const events = {
        get: `${modelName}.findOne.after`,
        patch: `${modelName}.update.after`,
        'delete': `${modelName}.delete.after`,
      };

      const event = events[method];

      if (restle.listeners(event).length) {
        return restle.emit(event, resource, req, res, next);
      }

      return next();
    })

    // serialize response
    .all((req, res, next) => {
      const method = req.method.toLowerCase();

      // TODO: send 200 if other props are updated
      if (method === 'patch' || method === 'delete') {
        return res.sendStatus(204);
      }

      return res.json(req.resource.serialize());
    });

    router.route(relationshipEndpoint)

    // handle before events
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const restle = this.restle;
      const events = {
        get: `${modelName}.findRelationship.before`,
        patch: `${modelName}.updateRelationship.before`,
        'delete': `${modelName}.deleteRelationship.before`,
        post: `${modelName}.appendRelationship.before`,
      };

      const event = events[method];

      if (restle.listeners(event).length) {
        return restle.emit(event, req, res, next);
      }

      return next();
    })

    // retrieve a relationship
    .get((req, res, next) => {
      return this.findRelationship(req, res, next);
    })

    // append relationship
    .post((req, res, next) => {
      if (!isValidContentType(req)) {
        return res.sendStatus(415);
      }

      return this.appendRelationship(req, res, next);
    })

    // update relationship
    .patch((req, res, next) => {
      if (!isValidContentType(req)) {
        return res.sendStatus(415);
      }

      return this.updateRelationship(req, res, next);
    })

    // delete a relationship
    .delete((req, res, next) => {
      if (!isValidContentType(req)) {
        return res.sendStatus(415);
      }

      return this.deleteRelationship(req, res, next);
    })

    // handle after event
    .all((req, res, next) => {
      const method = req.method.toLowerCase();
      const modelName = parseModelName(req.params.type);
      const restle = this.restle;

      const events = {
        get: `${modelName}.findRelationship.after`,
        patch: `${modelName}.updateRelationship.after`,
        'delete': `${modelName}.deleteRelationship.after`,
        post: `${modelName}.appendRelationship.after`,
      };

      const event = events[method];
      const relationship = req.relationship;

      if (restle.listeners(event).length) {
        return restle.emit(event, relationship, req, res, next);
      }

      return next();
    })

    // serialize response
    .all((req, res, next) => {
      if (!req.relationship) {
        return res.sendStatus(204);
      }

      return res.json(req.relationship.serialize());
    });

    router.route(relatedEndpoint)
      .get((req, res) => {
        return this.findRelated(req, res);
      });
  }
}
