import { EventEmitter } from 'events';

import Router from './router';

import db from './db';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

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

    options.restle = this;
    const router = new Router(options);
    const app = express();

    // express middleware
    app.use(bodyParser.json({ type: 'application/*+json' }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // TODO: better handling of options and handing off options to Router and Serializer
    this.database = options.database;
    this.namespace = options.namespace || '/';
    this.port = options.port || 3000;
    this.app = app;
    this.router = router;

    // enable cors
    // TODO: add way more security to this
    app.use(cors());

    // connect to db
    db(this.database).then(() => {
      this.emit('ready');
    });

    // use the router
    app.use(this.namespace, this.router.router);

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
    this.router.register(model, schema);
  }

  model(type) {
    return this.router.model(type);
  }

  // TODO: should probably go in the router?
  addRoute(endpoint, method, callback) {
    const app = this.app;
    const router = new express.Router();

    router.route('/')[method](callback);
    app.use(endpoint, router);
  }

  // TODO: figure out if there are any more aliases that need to go here
}
