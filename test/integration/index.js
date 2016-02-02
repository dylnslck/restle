import Restle from '../../../dist/lib';
import Promise from 'bluebird';
import test from 'tape';
import schemas from '../fixtures/restle-schemas';

import adapter from './adapter';
import model from './model';
import router from './router';

const app = new Restle({ namespace: 'api', port: 1337 });

app.register(schemas);

app.on('ready', () => {
  console.log('App is ready!');

  // adapter -> model -> router
  test('adapter tests', t => {
    const models = {
      person: app.model('person'),
      animal: app.model('animal'),
      building: app.model('building'),
      habitat: app.model('habitat'),
      company: app.model('company'),
      country: app.model('country'),
    };

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
});
