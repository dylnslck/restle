import Restle from '../../../dist/lib';
import Resource from '../../../dist/lib/model/resource';
import Relationship from '../../../dist/lib/model/relationship';
import ResourceArray from '../../../dist/lib/model/resource-array';
import schemas from '../fixtures/restle-schemas';

import Promise from 'bluebird';
import test from 'tape';
import before from 'tape';
import supertest from 'supertest';

const app = new Restle({ namespace: 'api', port: 1337 });

const person = app.register('person', schemas.person);
const animal = app.register('animal', schemas.animal);

test(`before and after`, assert => {
  const request = supertest('http://localhost:1337/api');

  request.get('/people')
    .set('Content-Type', 'application/vnd.api+json')
    .expect('Content-Type', /application\/vnd\.api\+json/)
    .expect(200)
    .end((err, res) => {
      const body = res.body;
      assert.error(err, 'response status should be 200');
      assert.deepEqual(body, {
        links: {
          self: `/api/people`,
        },
        data: [],
        included: [],
      }, 'response body should look good with a links and data members');

      assert.end();
    });

  app.before('person.find', (req, res, next) => {
    assert.ok(req, 'req object found before person.find');
    return next();
  });

  app.after('person.find', (resourceArray, req, res, next) => {
    assert.ok(req, 'req object found after person.find');
    assert.ok(req.resourceArray instanceof ResourceArray, 'req.resourceArray is an instance of ResourceArray');
    assert.ok(resourceArray instanceof ResourceArray, 'resourceArray is an instance of ResourceArray');
    return next();
  });
});
