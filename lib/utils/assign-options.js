import Adapter from 'restle-memory';
import Router from '../router';
import express from 'express';

export default (instance, options = {}) => {
  Object.assign(instance, {
    models: {},
    adapter: options.adapter || new Adapter(),
    router: new Router(options),
    app: express(),
    namespace: options.namespace ? `/${options.namespace}` : '',
    port: options.port || 3000,
    cors: options.cors || '*',
  });
}
