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

    // TODO: better handling of options and handing off options to Router and Serializer
    this.database = options.database;
    this.namespace = options.namespace || '/';
    this.port = options.port || 3000;
    this.app = app;
    this.router = router;

    // enable cors
    // TODO: add way more security to this
    console.log('using cors!');
    app.use(cors());

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

  // TODO: figure out if there are any more aliases that need to go here
}
