import express from 'express';
import inflect from 'i';
import _ from 'lodash';
import Model from '../model';
import Resource from '../model/resource';

import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  RelationshipError,
  AdapterError,
} from 'restle-error';

// router utilites
import isValidContentType from './utils/check-content-type';
import checkPost from './utils/check-post';
import checkUpdate from './utils/check-update';
import parseRequestBody from './utils/parse-request-body';
import parseSortQuery from './utils/parse-sort-query';

// general utilites
import parseModelName from '../utils/parse-model-name';

/**
 * The Router class is Restle's view layer - it uses Express and manages the
 * routes defined in the www.jsonapi.org specification. The Router uses Restle's
 * internal ORM to manage CRUD, handles query related operations like filtering,
 * sorting, pagination, inclusion, etc.
 *
 * @todo Sparse fieldsets and inclusion.
 * @private
 */
export default class Router {
  constructor(options = {}) {
    const { port, namespace, restle } = options;
    const router = new express.Router();

    Object.assign(this, {
      port, namespace, restle, router,
    });

    this.setupRoutes();
  }

  /**
   * This method is an alias for `Restle.Model.model()`.
   *
   * @private
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
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  find(req, res, next) {
    const { type } = req.params;
    const options = req.query;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    if ('sort' in options)
      options.sort = parseSortQuery(options.sort);

    model.find(options).then(resourceArray => {
      req.resourceArray = resourceArray;
      return next();
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method fetches a single resources of type `req.params.type`, then
   * serializes the response JSON.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  findResource(req, res, next) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    model.findResource(id).then(resource => {
      req.resource = resource;
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method fetches a resource or resource array that is related to a
   * particular resource.
   *
   * @todo Refactor resourceArray name
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  findRelated(req, res, next) {
    const { type, id, field } = req.params;
    const options = req.query;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    if ('sort' in options)
      options.sort = parseSortQuery(options.sort);

    model.findRelated(id, field, options).then(resourceArray => {
      req.resourceArray = resourceArray;
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      throw res.sendStatus(500);
    });
  }

  /**
   * This method creates a single resources of type `req.params.type`, then
   * serializes the response JSON.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  createResource(req, res, next) {
    const isBadRequest = checkPost(req, res);

    if (isBadRequest)
      return res.status(isBadRequest.status)
        .json(isBadRequest.json);

    const body = parseRequestBody(req.body);
    const type = parseModelName(req.params.type);
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    model.create(body).then(resource => {
      res.set('location', `${this.namespace}/${resource.type}/${resource.id}`);
      res.status(201);
      req.resource = resource;

      return next();
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      throw res.sendStatus(500);
    });
  }

  /**
   * This method updates a single resources of type `req.params.type`, then
   * sends a 204.
   *
   * @todo Send a 200 if any other properties outside the request context change
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  updateResource(req, res, next) {
    const isBadRequest = checkUpdate(req, res);

    if (isBadRequest)
      return res.status(isBadRequest.status)
        .json(isBadRequest.json);

    const body = parseRequestBody(req.body);
    const type = parseModelName(req.params.type);
    const id = req.params.id;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    model.update(id, body).then(resource => {
      req.resource = resource;
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method deletes a single resources of type `req.params.type` with an id
   * of `req.params.id`.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  deleteResource(req, res, next) {
    const { type, id } = req.params;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(403);

    model.delete(id).then(success => {
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      throw res.sendStatus(500);
    });
  }

  /**
   * This method returns a relationship.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  findRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    model.findResource(id).then(resource => {
      req.relationship = resource.relationship(field);
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method updates a relationship.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  updateRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);
    const body = req.body;

    if (undefined === model)
      return res.sendStatus(404);

    model.findResource(id).then(resource => {
      const relationship = resource.relationship(field);

      if (undefined === relationship)
        return res.sendStatus(404);

      const ids = Array.isArray(body.data)
        ? body.data.map(d => d.id)
        : body.data.id;

      return relationship.set(ids);
    }).then(resource => {
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(RelationshipError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method appends a resource to a relationship.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  appendRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);
    const body = req.body;

    if (undefined === model)
      return res.sendStatus(404);

    model.findResource(id).then(resource => {
      const relationship = resource.relationship(field);

      if (undefined === relationship)
        return res.sendStatus(404);

      const ids = Array.isArray(body.data)
        ? body.data.map(d => d.id)
        : body.data.id;

      return relationship.append(ids);
    }).then(resource => {
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(RelationshipError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method deletes resourc(s) from a relationship.
   *
   * @private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  deleteRelationship(req, res, next) {
    const { type, id, field } = req.params;
    const model = this.model(type);
    const body = req.body;

    if (undefined === model)
      return res.sendStatus(404);

    model.findResource(id).then(resource => {
      const relationship = resource.relationship(field);

      if (undefined === relationship)
        return res.sendStatus(404);

      const ids = Array.isArray(body.data)
        ? body.data.map(d => d.id)
        : body.data.id;

      return relationship.delete(ids);
    }).then(resource => {
      return next();
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(RelationshipError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      return res.sendStatus(500);
    });
  }

  /**
   * This method fetches a resource or resource array that is related to a
   * particular resource.
   *
   * @todo Add before and after events for finding related.
   * @private
   * @param {Object} req
   * @param {Object} res
   */
  findRelated(req, res) {
    const { type, id, field } = req.params;
    const options = req.query;
    const model = this.model(type);

    if (undefined === model)
      return res.sendStatus(404);

    if ('sort' in options)
      options.sort = parseSortQuery(options.sort);

    const namespace = this.namespace;

    model.findRelated(id, field, options).then(results => {
      res.json(results.serialize({ namespace }));
    }).catch(NotFoundError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(AdapterError, err => {
      return res.status(err.status).json(err.serialize());
    }).catch(err => {
      throw res.sendStatus(500);
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
   *
   * @private
   * @todo Needs major refactoring
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

      return restle.listeners(event).length
        ? restle.emit(event, req, res, next)
        : next();
    });

    router.route(manyResourcesEndpoint)

      // handle before event
      .all((req, res, next) => {
        const method = req.method.toLowerCase();
        const modelName = parseModelName(req.params.type);
        const restle = this.restle;
        const event = `${modelName}.${method === 'get' ? 'find.before' : 'create.before'}`;

        return restle.listeners(event).length
          ? restle.emit(event, req, res, next)
          : next();
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

        return restle.listeners(event).length
          ? restle.emit(event, req, res, next)
          : next();
      })

      // serialize response
      .all((req, res, next) => {
        const type = req.params.type;
        const options = {
          namespace: this.namespace,
        };

        return res.json(req.resourceArray
          ? req.resourceArray.serialize(options)
          : req.resource.serialize(options));
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

        return restle.listeners(event).length
          ? restle.emit(event, req, res, next)
          : next();
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
      const namespace = this.namespace;

      // TODO: send 200 if other props are updated
      if (method === 'patch' || method === 'delete') {
        return res.sendStatus(204);
      }

      return res.json(req.resource.serialize({ namespace }));
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

        const namespace = this.namespace;
        return res.json(req.relationship.serialize({ namespace }));
      });

    router.route(relatedEndpoint)
      .get((req, res) => {
        return this.findRelated(req, res);
      });
  }
}
