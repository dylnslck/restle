import Restle from '../../../dist/lib';
import Resource from '../../../dist/lib/model/resource';
import Relationship from '../../../dist/lib/model/relationship';
import ResourceArray from '../../../dist/lib/model/resource-array';
import schemas from '../fixtures/restle-schemas';

import Promise from 'bluebird';
import test from 'tape';
import before from 'tape';

const app = new Restle({ namespace: 'api' });
const person = app.register('person', schemas.person);
const animal = app.register('animal', schemas.animal);
const building = app.register('building', schemas.building);
const habitat = app.register('habitat', schemas.habitat);
const company = app.register('company', schemas.company);
const country = app.register('country', schemas.country);

test('create two countries', assert => {
  const germany = country.createResource({ name: 'Germany' });
  const england = country.createResource({ name: 'England' });

  Promise.all([ germany, england ])
    .then(countries => {
      assert.ok(countries[0] instanceof Resource, 'first country is a Resource');
      assert.ok(countries[1] instanceof Resource, 'second country is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('create four habitats', assert => {
  const desert = habitat.createResource({ name: 'desert' });
  const tropical = habitat.createResource({ name: 'tropical', countries: [1] });
  const dry = habitat.createResource({ name: 'dry', countries: [2] });
  const arctic = habitat.createResource({ name: 'arctic', countries: [1, 2] });

  Promise.all([ desert, tropical, dry, arctic ])
    .then(habitats => {
      assert.ok(habitats[0] instanceof Resource, 'first habitat is a Resource');
      assert.ok(habitats[1] instanceof Resource, 'second habitat is a Resource');
      assert.ok(habitats[2] instanceof Resource, 'third habitat is a Resource');
      assert.ok(habitats[3] instanceof Resource, 'fourth habitat is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('create first animal', assert => {
  animal.createResource({ age: 5, species: 'dog' })
    .then(animal => {
      assert.ok(animal instanceof Resource, 'first animal is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('create two buildings', assert => {
  const big = building.createResource({ size: 10, location: 1 });
  const small = building.createResource({ size: 2, location: 2 });

  Promise.all([small, big])
    .then(buildings => {
      assert.ok(buildings[0] instanceof Resource, 'first building is a Resource');
      assert.ok(buildings[1] instanceof Resource, 'second building is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('create first company', assert => {
  company.createResource({ name: 'Apple', industry: 'electronics', office: 1 })
    .then(company => {
      assert.ok(company instanceof Resource, 'first company is a resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    })
});

test('create first person', assert => {
  person.createResource({
    name: 'Dylan',
    email: 'dylanslack@gmail.com',
    pets: [1],
    company: 1,
  })
  .then(person => {
    assert.ok(person instanceof Resource, 'first person is a resource');
    assert.end();
  })
  .catch(err => {
    assert.fail(err);
  });
});

test('create second animal', assert => {
  animal.createResource({ age: 15, species: 'elephant', owner: 1 })
    .then(animal => {
      assert.ok(animal instanceof Resource, 'second animal is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});


test('create second company', assert => {
  company.createResource({ name: 'Google', industry: 'search', office: 2, employees: [1] })
    .then(company => {
      assert.ok(company instanceof Resource, 'second company is a resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    })
});

test('create second person', assert => {
  person.createResource({
    name: 'Billy',
    email: 'billy@gmail.com',
    pets: [1, 2],
    company: 2,
  })
  .then(person => {
    assert.ok(person instanceof Resource, 'first person is a resource');
    assert.end();
  })
  .catch(err => {
    assert.fail(err);
  });
});

test('find first person', assert => {
  person.findResource(1)
    .then(person => {
      assert.ok(person instanceof Resource, 'found person is a resource');
      assert.ok(person.getRelationship('company') instanceof Relationship, 'person company relationship is a relationship');
      person.get('company')
        .then(company => {
          assert.ok(company instanceof Resource, 'person company is a resource');
          assert.ok(company.getRelationship('office') instanceof Relationship, 'person company office relationship is a relationship');
          company.get('office')
            .then(office => {
              assert.ok(office instanceof Resource, 'person company office is a resource');
              office.get('location').then(location => {
                assert.ok(location instanceof Resource, 'person company office location is a resource');
                assert.end();
              });
            })
            .catch(err => {
              assert.fail(err);
            });
        })
        .catch(err => {
          assert.fail(err);
        })
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('find second person', assert => {
  person.findResource(2)
    .then(person => {
      assert.ok(person instanceof Resource, 'person is a resource');
      assert.ok(person.getRelationship('pets') instanceof Relationship, 'person pets relationship is a relationship');
      person.get('pets').then(pets => {
        assert.ok(pets instanceof ResourceArray, 'person pets is a resource array');
        pets.get(2, 'owner').then(owner => {
          assert.ok(owner instanceof Resource, 'person second pet owner is a resource');
          assert.end();
        });
      });
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('find second company', assert => {
  company.findResource(2)
    .then(company => {
      assert.ok(company instanceof Resource, 'company is a resource');
      assert.ok(company.getRelationship('employees') instanceof Relationship, 'company employees relationship is a relationship');
      company.get('employees').then(employees => {
        assert.ok(employees instanceof ResourceArray, 'company employees is a resource array');

        employees.get(1, 'pets').then(pets => {
          assert.ok(pets instanceof ResourceArray, 'company first employee pets is a resource array');

          assert.deepEqual(company.serialize(), {
            links: {
              self: '/api/companies/2',
            },
            data: {
              id: '2',
              type: 'company',
              attributes: {
                name: 'Google',
                industry: 'search',
              },
              relationships: {
                employees: {
                  links: {
                    self: '/api/companies/2/relationships/employees',
                    related: '/api/companies/2/employees',
                  },
                  data: [{
                    type: 'person',
                    id: '1'
                  }]
                },
                office: {
                  links: {
                    self: '/api/companies/2/relationships/office',
                    related: '/api/companies/2/office',
                  },
                  data: { type: 'building', id: '2' },
                },
              },
            },
            included: [{
              type: 'person',
              id: '1',
              attributes: {
                name: 'Dylan',
                email: 'dylanslack@gmail.com',
              },
              relationships: {
                pets: {
                  links: {
                    self: '/api/people/1/relationships/pets',
                    related: '/api/people/1/pets',
                  },
                  data: [{
                    type: 'animal',
                    id: '1',
                  }],
                },
                company: {
                  links: {
                    self: '/api/people/1/relationships/company',
                    related: '/api/people/1/company',
                  },
                  data: { type: 'company', id: '1', },
                },
              },
              links: {
                self: '/api/people/1',
              },
            }],
          }, 'serialized company json looks good');

          assert.end();
        });
      });
    })
    .catch(err => {
      assert.fail(err);
    });
});
