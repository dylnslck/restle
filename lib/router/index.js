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
   * This method is an alias for `Restle.model()`.
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
  find(req, res) {
    const { type } = req.params;
    const query = req.query;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.find(query)
      .then(resourceArray => {
        return res.json(resourceArray.serialize());
      })
      .catch(err => {
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
  findResource(req, res) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.findResource(id)
      .then(resource => {
        return res.json(resource.serialize());
      })
      .catch(err => {
        if (err === 'Resource not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource not found',
              detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
            }],
          });
        }

        throw new Error(err);
      });
  }

  findRelated(req, res) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    // TODO: resourceArray needs a better name, as it may be a Resource not ResourceArray
    model.findRelated(id, field)
      .then(resourceArray => {
        return res.json(resourceArray.serialize());
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  findRelationship(req, res) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.findRelationship(id, field)
      .then(relationship => {
        return res.json(relationship.serialize());
      })
      .catch(err => {
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
  createResource(req, res) {
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

    model.createResource(body)
      .then(resource => {
        res.set('location', resource.self());
        return res.status(201).json(resource.serialize());
      })
      .catch(err => {
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

  updateResource(req, res) {
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

    model.updateResource(id, body)
      .then(resource => {
        return res.sendStatus(204);
      })
      .catch(err => {
        if (err === 'Resource not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource not found',
              detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
            }],
          });
        }

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
  deleteResource(req, res) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(403);
    }

    model.deleteResource(id)
      .then(success => {
        return res.sendStatus(204);
      })
      .catch(err => {
        if (err === 'Resource not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource not found',
              detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
            }],
          });
        }

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
  findRelationship(req, res) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.findRelationship(id, field)
      .then(resourceArray => {
        return res.json(resourceArray.serialize());
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  /**
   * This method appends a resource identifier object to a relationship array.
   *
   * @param {Object} req
   * @param {Object} res
   */
  appendRelationship(req, res) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    const ids = _.map(update.data, data => data.id);

    model.appendRelationship(id, field, ids)
      .then(success => {
        return res.sendStatus(204);
      })
      .catch(err => {
        if (err) {
          return res.status(403).json({
            errors: [{
              status: 403,
              title: 'Cannot append to-one relationships',
              detail: `You cannot POST to to-one relationship, use PATCH instead.`,
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
  updateRelationship(req, res) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    model.updateRelationship(id, field, update)
      .then(success => {
        return res.sendStatus(204);
      })
      .catch(err => {
        if (err === 'Resource not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource not found',
              detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
            }],
          });
        }

        if (err === 'Relationship not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource relationship not found',
              detail: `The relationship ${field} was not found.`,
            }],
          });
        }

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
  deleteRelationship(req, res) {
    const { type, id, field } = req.params;
    const update = req.body;
    const model = this.model(type);

    if (!model) {
      return res.sendStatus(404);
    }

    const ids = _.map(update.data, data => data.id);

    model.deleteRelationship(id, field, ids)
      .then(success => {
        return res.sendStatus(204);
      })
      .catch(err => {
        if (err === 'Resource not found') {
          return res.status(404).json({
            errors: [{
              status: 404,
              title: 'Resource not found',
              detail: `A resource of type ${type} with id ${id} was not found in the adapter.`,
            }],
          });
        }

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
      .all((req, res, next) => {
        const method = req.method.toLowerCase();
        const modelName = parseModelName(req.params.type);
        const restle = this.restle;
        const event = `${modelName}.${method === 'get' ? 'find' : 'create'}`;

        if (restle.listeners(event).length) {
          return restle.emit(event, req, res, next);
        }

        return next();
      })
      .get((req, res) => {
        return this.find(req, res);
      })
      .post((req, res) => {
        if (!isValidContentType(req)) {
          return res.sendStatus(415);
        }

        return this.createResource(req, res);
      });

    router.route(singleResourceEndpoint)
      .all((req, res, next) => {
        const method = req.method.toLowerCase();
        const modelName = parseModelName(req.params.type);
        const restle = this.restle;

        const events = {
          get: `${modelName}.findOne`,
          patch: `${modelName}.update`,
          'delete': `${modelName}.delete`,
        };

        const event = events[method];

        if (restle.listeners(event).length) {
          return restle.emit(event, req, res, next);
        }

        return next();
      })
      .get((req, res) => {
        return this.findResource(req, res);
      })
      .patch((req, res) => {
        if (!isValidContentType(req)) {
          return res.sendStatus(415);
        }

        return this.updateResource(req, res);
      })
      .delete((req, res) => {
        return this.deleteResource(req, res);
      });

    router.route(relationshipEndpoint)
      .all((req, res, next) => {
        const method = req.method.toLowerCase();
        const modelName = parseModelName(req.params.type);
        const restle = this.restle;
        const events = {
          get: `${modelName}.findRelationship`,
          patch: `${modelName}.updateRelationship`,
          'delete': `${modelName}.deleteRelationship`,
          post: `${modelName}.appendRelationship`,
        };

        const event = events[method];

        if (restle.listeners(event).length) {
          return restle.emit(event, req, res, next);
        }

        return next();
      })
      .get((req, res) => {
        return this.findRelationship(req, res);
      })
      .post((req, res) => {
        if (!isValidContentType(req)) {
          return res.sendStatus(415);
        }

        return this.appendRelationship(req, res);
      })
      .patch((req, res) => {
        if (!isValidContentType(req)) {
          return res.sendStatus(415);
        }

        return this.updateRelationship(req, res);
      })
      .delete((req, res) => {
        if (!isValidContentType(req)) {
          return res.sendStatus(415);
        }

        return this.deleteRelationship(req, res);
      });

    router.route(relatedEndpoint)
      .get((req, res) => {
        return this.findRelated(req, res);
      });
  }
}
