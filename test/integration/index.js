import Restle from '../../../dist/lib';
import Promise from 'bluebird';
import test from 'tape';
import schemas from '../fixtures/restle-schemas';

import adapter from './adapter';
import model from './model';
import router from './router';

const app = new Restle({ namespace: 'api', port: 1337 });

const person = app.register('person', schemas.person);
const animal = app.register('animal', schemas.animal);
const building = app.register('building', schemas.building);
const habitat = app.register('habitat', schemas.habitat);
const company = app.register('company', schemas.company);
const country = app.register('country', schemas.country);
const models = { person, animal, building, habitat, company, country };

// adapter -> model -> router
test('adapter tests', t => {
  adapter(t, app, models).then(success => {
    t.ok(success, 'adapter tests were successful');
    t.end();
  });
});

test('model tests', t => {
  model(t, app).then(success => {
    t.ok(success, 'model tests were successful');
    t.end();
  });
});

test('router tests', t => {
  router(t, app).then(success => {
    t.ok(success, 'router tests were successful');
    t.end();
  });
});

test('teardown', t => {
  app.disconnect().then(() => {
    t.pass('app disconnected');
    t.end();
  });
});
