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
const building = app.register('building', schemas.building);
const habitat = app.register('habitat', schemas.habitat);
const company = app.register('company', schemas.company);
const country = app.register('country', schemas.country);

test('Restle integration tests', (t) => {
  const request = supertest('http://localhost:1337/api');

  t.test('GET /people (first time)', (assert) => {
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
  });

  t.test('POST /people (without data)', (assert) => {
    request.post('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(400)
      .end((err, res) => {
        assert.error(err, 'no `data` key in post body gives 400');
        assert.ok(res.body.errors, 'the errors object is there');
        assert.notOk(res.body.data, 'the data object is not there');
        assert.notOk(res.body.includes, 'the includes object is not there');
        assert.end();
      });
  });

  t.test('POST /people (without data.type)', (assert) => {
    request.post('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({ data: { invalidData: true }}))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(400)
      .end((err, res) => {
        assert.error(err, 'no `data.type` key in post body gives 400');
        assert.ok(res.body.errors, 'the errors object is there');
        assert.notOk(res.body.data, 'the data object is not there');
        assert.notOk(res.body.includes, 'the includes object is not there');
        assert.end();
      });
  });

  t.test('POST /people (with bad data.type)', (assert) => {
    request.post('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({ data: { type: 'animal' }}))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(409)
      .end((err, res) => {
        assert.error(err, 'a bad type in post body gives 409');
        assert.ok(res.body.errors, 'the errors object is there');
        assert.end();
      });
  });

  t.test('POST /people (with data.type and attributes)', (assert) => {
    request.post('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'person',
          attributes: {
            name: 'Bobby Jones',
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(201)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'successfully created should give 201');
        assert.equal(res.headers.location, `/api/people/${body.data.id}`, 'the location header matches the links self member');

        assert.deepEqual(body, {
          links: {
            self: `/api/people/${body.data.id}`,
          },
          data: {
            type: 'person',
            id: body.data.id,
            attributes: {
              name: 'Bobby Jones',
            },
            relationships: {
              pets: {
                data: [],
                links: {
                  self: `/api/people/${body.data.id}/relationships/pets`,
                  related: `/api/people/${body.data.id}/pets`,
                },
              },
              company: {
                data: null,
                links: {
                  self: `/api/people/${body.data.id}/relationships/company`,
                  related: `/api/people/${body.data.id}/company`,
                },
              },
            },
          },
          included: [],
        }, 'the response body should have the proper links and primary data with attributes');
        assert.end();
      });
  });

  t.test('POST /animals then POST /people with animal relationship', (assert) => {
    request.post('/animals')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'animal',
          attributes: {
            species: 'Dog',
            age: 5,
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(201)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'successfully created animal should give 201');
        assert.deepEqual(body, {
          links: {
            self: `/api/animals/${body.data.id}`,
          },
          data: {
            type: 'animal',
            id: body.data.id,
            attributes: {
              species: 'Dog',
              age: 5,
            },
            relationships: {
              owner: {
                data: null,
                links: {
                  self: `/api/animals/${body.data.id}/relationships/owner`,
                  related: `/api/animals/${body.data.id}/owner`,
                },
              },
              habitats: {
                data: [],
                links: {
                  self: `/api/animals/${body.data.id}/relationships/habitats`,
                  related: `/api/animals/${body.data.id}/habitats`,
                },
              },
            },
          },
          included: [],
        }, 'the response body should have the proper links and primary data with attributes');

        request.post('/people')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            data: {
              type: 'people',
              attributes: {
                name: 'Billy Smith',
              },
              relationships: {
                pets: {
                  data: [{
                    type: 'animal',
                    id: body.data.id,
                  }],
                },
              },
            },
          }))
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(201)
          .end((errPerson, resPerson) => {
            const bodyPerson = resPerson.body;
            assert.error(errPerson, 'successfully created person should give 201');
            assert.deepEqual(bodyPerson, {
              links: {
                self: `/api/people/${bodyPerson.data.id}`,
              },
              data: {
                type: 'person',
                id: bodyPerson.data.id,
                attributes: {
                  name: 'Billy Smith',
                },
                relationships: {
                  pets: {
                    links: {
                      self: `/api/people/${bodyPerson.data.id}/relationships/pets`,
                      related: `/api/people/${bodyPerson.data.id}/pets`,
                    },
                    data: [{
                      type: 'animal',
                      id: `${body.data.id}`,
                    }],
                  },
                  company: {
                    links: {
                      self: `/api/people/${bodyPerson.data.id}/relationships/company`,
                      related: `/api/people/${bodyPerson.data.id}/company`,
                    },
                    data: null,
                  },
                },
              },
              included: [{
                attributes: {
                  species: 'Dog',
                  age: 5,
                },
                id: `${body.data.id}`,
                type: 'animal',
                links: {
                  self: `/api/animals/${body.data.id}`,
                },
              }],
            });
            assert.end();
          });
      });
  });

  t.test('PATCH /people/invalid', assert => {
    request.patch(`/people/invalid`)
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'person',
          id: 'invalid',
          attributes: {
            name: 'New Name',
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(403)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'PATCH /people/invalid should return a 403');
        // TODO: deep equal with errors
        assert.ok(body.errors, 'the errors object exists');
        assert.end();
      });
  });

  t.test('PATCH /people/55a67e56864054d13dd730a5', assert => {
    request.patch(`/people/55a67e56864054d13dd730a5`)
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'person',
          id: '55a67e56864054d13dd730a5',
          attributes: {
            name: 'Another Name',
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(404)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'PATCH /people/55a67e56864054d13dd730a5 should not find a resource and return a 404');
        // TODO: deep equal with errors
        assert.ok(body.errors, 'the errors object exists');
        assert.end();
      });
  });

  t.test('PATCH /people/different-ids', assert => {
    request.patch(`/people/55a686e7ae28cf333f972e3e`)
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'person',
          id: '55a67e56864054d13dd730a5',
          attributes: {
            name: 'Another Name',
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(409)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'PATCH /people/ with different ids type should return a 409');
        // TODO: deep equal
        assert.ok(body.errors, 'the errors object exists');
        assert.end();
      });
  });

  t.test('GET /people then PATCH first user with new attributes', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        const body = res.body;
        const id = body.data[0].id;

        assert.error(err, 'GET /people should give 200');

        request.patch(`/people/${id}`)
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            data: {
              type: 'person',
              id: `${id}`,
              attributes: {
                name: 'New Name',
              },
            },
          }))
          .expect(204)
          .end(newErr => {
            assert.error(newErr, 'PATCH should give 204');
            assert.end();
          });
      });
  });

  t.test('GET /people/invalid', assert => {
    request.get(`/people/invalid`)
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(403)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'GET /people/invalid should return a 403');
        // TODO: deep equal with errors
        assert.ok(body.errors, 'the errors object exists');
        assert.end();
      });
  });

  t.test('GET /people/55a67e56864054d13dd730a5', assert => {
    request.get(`/people/55a67e56864054d13dd730a5`)
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(404)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'GET /people/55a67e56864054d13dd730a5 should not find a resource and return a 404');
        // TODO: deep equal with errors
        assert.ok(body.errors, 'the errors object exists');
        assert.end();
      });
  });

  t.test('GET /people to check attributes', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'get /people should give 200');
        assert.equal(body.data.length, 2, 'there should be two people in the database');
        const id = res.body.data[0].id;
        assert.ok(id, 'there is a valid id for the first user returned');

        request.get(`/people/${id}`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((newErr, newRes) => {
            const newBody = newRes.body;

            assert.deepEqual(newBody, {
              links: {
                self: `/api/people/${id}`,
              },
              data: {
                type: 'person',
                id: `${id}`,
                attributes: {
                  name: 'New Name',
                },
                relationships: {
                  pets: {
                    data: [],
                    links: {
                      self: `/api/people/${id}/relationships/pets`,
                      related: `/api/people/${id}/pets`,
                    },
                  },
                  company: {
                    data: null,
                    links: {
                      self: `/api/people/${id}/relationships/company`,
                      related: `/api/people/${id}/company`,
                    },
                  },
                },
              },
              included: [],
            });
            assert.end();
          });
      });
  });

  t.test('GET /people then GET /people/:id/relationships/pets', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        const body = res.body;
        assert.error(err, 'get /people should give 200');
        assert.equal(body.data.length, 2, 'there should be two people in the database');
        const firstId = body.data[0].id;
        const secondId = body.data[1].id;
        assert.ok(firstId, 'there is a valid id for the first user returned');
        assert.ok(secondId, 'there is a valid id for the second user returned');

        request.get(`/people/${firstId}/relationships/pets`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((firstErr, firstRes) => {
            const firstBody = firstRes.body;
            assert.deepEqual(firstBody, {
              links: {
                self: `/api/people/${firstId}/relationships/pets`,
                related: `/api/people/${firstId}/pets`,
              },
              data: [],
            }, 'first relationships response has valid links and empty data array');

            request.get(`/people/${secondId}/relationships/pets`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(200)
              .end((secondErr, secondRes) => {
                const secondBody = secondRes.body;

                assert.deepEqual(secondBody, {
                  links: {
                    self: `/api/people/${secondId}/relationships/pets`,
                    related: `/api/people/${secondId}/pets`,
                  },
                  data: [{
                    type: 'animal',
                    id: secondBody.data[0].id,
                  }],
                }, 'second relationships response has valid links and populated data array');
                assert.end();
              });
          });
      });
  });

  t.test('GET /people then PATCH /people/:id/relationships/pets with []', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.patch(`/people/${peopleId}/relationships/pets`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect(204)
          .send(JSON.stringify({
            data: [],
          }))
          .end(relationshipErr => {
            assert.error(relationshipErr, 'PATCH /people/:id/relationships/pets should give 204');
            assert.end();
          });
      });
  });

  t.test('GET /people then GET /animals then POST /people/:id/relationships/pets with an animal', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;
            assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
            assert.ok(animalId, 'the first animal resource has an id');

            request.post(`/people/${peopleId}/relationships/pets`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect(204)
              .send(JSON.stringify({
                data: [{
                  id: `${animalId}`,
                  type: 'animal',
                }],
              }))
              .end(relationshipErr => {
                assert.error(relationshipErr, 'POST /people/:id/relationships/pets should give 204');
                assert.end();
              });
          });
      });
  });

  t.test('GET /people then GET /animals then POST /animals/:id/relationships/owner with a person', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;
            assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
            assert.ok(animalId, 'the first animal resource has an id');

            request.post(`/animals/${animalId}/relationships/owner`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect(403)
              .send(JSON.stringify({
                data: [{
                  id: `${peopleId}`,
                  type: 'person',
                }],
              }))
              .end((relationshipErr, relationshipRes) => {
                assert.error(relationshipErr, `POST /animals/${animalId}/relationships/owner should give 403`);
                assert.ok(relationshipRes.body.errors, 'the errors object is there.');
                assert.end();
              });
          });
      });
  });

  t.test('GET /people then GET /animals then PATCH /animals/:id/relationships/owner with an array of people', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;
            assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
            assert.ok(animalId, 'the first animal resource has an id');

            request.patch(`/animals/${animalId}/relationships/owner`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect(403)
              .send(JSON.stringify({
                data: [{
                  id: `${peopleId}`,
                  type: 'person',
                }],
              }))
              .end((relationshipErr, relationshipRes) => {
                assert.error(relationshipErr, `PATCH /animals/${animalId}/relationships/owner should give 403`);
                assert.ok(relationshipRes.body.errors, 'the errors object is there.');
                assert.end();
              });
          });
      });
  });

  t.test('GET /people then GET /animals then PATCH /animals/:id/relationships/owner with a single person', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;
            assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
            assert.ok(animalId, 'the first animal resource has an id');

            request.patch(`/animals/${animalId}/relationships/owner`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect(204)
              .send(JSON.stringify({
                data: {
                  id: `${peopleId}`,
                  type: 'person',
                },
              }))
              .end(relationshipErr => {
                assert.error(relationshipErr, `PATCH /animals/${animalId}/relationships/owner should give 204`);
                assert.end();
              });
          });
      });
  });

  t.test('GET /people then GET /animals then GET /animals/:id/relationships/owner', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            assert.error(animalsErr, 'GET /animals should give 200');
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;
            assert.ok(animalId, 'there is a valid id for the first animal returned');

            request.get(`/animals/${animalId}/relationships/owner`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(200)
              .end((relationshipErr, relationshipRes) => {
                const relationshipBody = relationshipRes.body;
                assert.error(relationshipErr, `GET /animals/${animalId}/relationships/owner should give 200`);
                assert.deepEqual(relationshipBody, {
                  links: {
                    self: `/api/animals/${animalId}/relationships/owner`,
                    related: `/api/animals/${animalId}/owner`,
                  },
                  data: {
                    id: `${peopleId}`,
                    type: 'person',
                  },
                }, 'first relationships response has valid links and data array');
                assert.end();
              });
          });
      });
  });

  t.test('GET /animals then GET /animals/:id/owner', (assert) => {
    request.get('/animals')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((animalsErr, animalsRes) => {
        assert.error(animalsErr, 'GET /animals should give 200');
        const animalsBody = animalsRes.body;
        const animalId = animalsBody.data[0].id;
        assert.ok(animalId, 'there is a valid id for the first animal returned');

        request.get(`/animals/${animalId}/owner`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((relationshipErr, relationshipRes) => {
            const relationshipBody = relationshipRes.body;
            const ownerId = relationshipBody.data.id;
            assert.error(relationshipErr, `GET /animals/${animalId}/relationships/owner should give 200`);
            assert.deepEqual(relationshipBody, {
              links: {
                self: `/api/animals/${animalId}/owner`,
              },
              data: {
                id: `${ownerId}`,
                type: 'person',
                attributes: {
                  name: 'Billy Smith',
                },
                relationships: {
                  pets: {
                    links: {
                      self: `/api/people/${ownerId}/relationships/pets`,
                      related: `/api/people/${ownerId}/pets`,
                    },
                    data: [{
                      id: '1',
                      type: 'animal',
                    }],
                  },
                  company: {
                    links: {
                      self: `/api/people/${ownerId}/relationships/company`,
                      related: `/api/people/${ownerId}/company`,
                    },
                    data: null,
                  },
                },
              },
              included: [{
                id: '1',
                type: 'animal',
                attributes: {
                  species: 'Dog',
                  age: 5
                },
                links: {
                  self: '/api/animals/1',
                },
              }],
            }, 'first relationships response has valid links and data array');
            assert.end();
          });
      });
  });

  t.test('GET /animals then GET /animals:id', (assert) => {
    request.get('/animals')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((animalsErr, animalsRes) => {
        assert.error(animalsErr, 'GET /animals should give 200');
        const animalsBody = animalsRes.body;
        const animalId = animalsBody.data[0].id;
        assert.ok(animalId, 'there is a valid id for the first animal returned');

        request.get(`/animals/${animalId}`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end(animalErr => {
            assert.error(animalErr, `GET /animals/${animalId}/ should give 200`);
            assert.end();
          });
      });
  });

  t.test('GET /people then GET /animals then DELETE /people/:id/relationships/pets with an animal', (assert) => {
    request.get('/people')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((peopleErr, peopleRes) => {
        const peopleBody = peopleRes.body;
        const peopleId = peopleBody.data[1].id;
        assert.error(peopleErr, 'GET /people should give 200 and correct media type');
        assert.ok(peopleId, 'the second person resource has an id');

        request.get('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end((animalsErr, animalsRes) => {
            const animalsBody = animalsRes.body;
            const animalId = animalsBody.data[0].id;

            assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
            assert.ok(animalId, 'the first animal resource has an id');

            request.delete(`/people/${peopleId}/relationships/pets`)
              .set('Content-Type', 'application/vnd.api+json')
              .expect(204)
              .send(JSON.stringify({
                data: [{
                  id: `${animalId}`,
                  type: 'animal',
                }],
              }))
              .end(relationshipErr => {
                assert.error(relationshipErr, 'DELETE /people/:id/relationships/pets should give 204');
                assert.end();
              });
          });
      });
  });

  t.test('GET /animals then DELETE /animals/:id then GET /animals to make sure there are none left', (assert) => {
    request.get('/animals')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((animalsErr, animalsRes) => {
        const animalsBody = animalsRes.body;
        const animalId = animalsBody.data[0].id;
        assert.error(animalsErr, 'GET /animals should give 200 and correct media type');
        assert.ok(animalId, 'the first animal resource has an id');

        request.delete(`/animals/${animalId}`)
          .set('Content-Type', 'application/vnd.api+json')
          .expect(204)
          .end(animalErr => {
            assert.error(animalErr, 'DELETE /animals/:id should give 204');

            request.get('/animals')
              .set('Content-Type', 'application/vnd.api+json')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(200)
              .end((secondAnimalsErr, secondAnimalsRes) => {
                const secondAnimalsBody = secondAnimalsRes.body;
                assert.error(secondAnimalsErr, 'GET /animals should give 200 and correct media type');
                assert.deepEqual(secondAnimalsBody, {
                  links: {
                    self: '/api/animals',
                  },
                  data: [],
                  included: [],
                }, 'the animals body has correct links and empty data');
                assert.end();
              });
          });
      });
  });

  t.test('POST /animals with species cat, dog, zebra', (assert) => {
    request.post('/animals')
      .set('Content-Type', 'application/vnd.api+json')
      .send(JSON.stringify({
        data: {
          type: 'animal',
          attributes: {
            species: 'Cat',
            age: 10,
          },
        },
      }))
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(201)
      .end(catErr => {
        assert.error(catErr, 'successfully created cat should give 201');

        request.post('/animals')
          .set('Content-Type', 'application/vnd.api+json')
          .send(JSON.stringify({
            data: {
              type: 'animal',
              attributes: {
                species: 'Dog',
                age: 5,
              },
            },
          }))
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(201)
          .end(dogErr => {
            assert.error(dogErr, 'successfully created dog should give 201');

            request.post('/animals')
              .set('Content-Type', 'application/vnd.api+json')
              .send(JSON.stringify({
                data: {
                  type: 'animal',
                  attributes: {
                    species: 'Zebra',
                    age: 14,
                  },
                },
              }))
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(201)
              .end(zebraErr => {
                assert.error(zebraErr, 'successfully created cat should give 201');
                assert.end();
              });
          });
      });
  });

  // TODO: deep equal
  t.test('GET /animals?page[offset]=1&page[limit]=2', (assert) => {
    request.get('/animals?page[offset]=1&page[limit]=2')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?page[offset]=1&page[limit]=1 should give 200');
        assert.end();
      });
  });

  t.test('GET /animals?sort=species,-age', (assert) => {
    request.get('/animals?sort=species,-age')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?sort=species,-age');
        assert.end();
      });
  });

  t.test('GET /animals?sort=-species,-age', (assert) => {
    request.get('/animals?sort=-species,-age')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?sort=-species,-age');
        assert.end();
      });
  });

  t.test('GET /animals?sort=-age', (assert) => {
    request.get('/animals?sort=-age')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?sort=-age');
        assert.end();
      });
  });

  t.test('GET /animals?species=Dog', (assert) => {
    request.get('/animals?species=Dog')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?species=Dog');
        assert.end();
      });
  });

  t.test('GET /animals?species=Dog&color=purple', (assert) => {
    request.get('/animals?species=Dog&color=purple')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'GET /animals?species=Dog&color=purple');
        assert.end();
      });
  });

  t.test('GET /animals?fields[animal]=age', (assert) => {
    request.get('/animals?fields[animal]=age')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        console.log(res.body.data[0].attributes);
        assert.error(err, 'GET /animals?fields[animal]=age');
        assert.end();
      });
  });

  t.test('POST /computers with no uuid', (assert) => {
    request.post('/computers')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(400)
      .send(JSON.stringify({
        data: {
          type: 'computer',
          attributes: {
            type: 'Supercomputer',
          },
        },
      }))
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'POST /computers with no uuid should give 400');
        assert.end();
      });
  });

  t.test('POST /computers with uuid', (assert) => {
    request.post('/computers')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(201)
      .send(JSON.stringify({
        data: {
          type: 'computer',
          attributes: {
            uuid: 1,
            type: 'Laptop',
          },
        },
      }))
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'POST /computers with uuid should give 201');
        assert.end();
      });
  });

  t.test('POST /computers with same uuid', (assert) => {
    request.post('/computers')
      .set('Content-Type', 'application/vnd.api+json')
      .expect('Content-Type', /application\/vnd\.api\+json/)
      .expect(400)
      .send(JSON.stringify({
        data: {
          type: 'computer',
          attributes: {
            uuid: 1,
            type: 'Destop',
          },
        },
      }))
      .end((err, res) => {
        console.log(res.body);
        assert.error(err, 'POST /computers with same uuid should give 400');
        assert.end();
        app.disconnect();
      });
  });

  app.on('disconnect', () => {
    console.log('Disconnecting!');
    t.end();
  });
});
