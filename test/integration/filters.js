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
    age: 22,
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
    age: 54,
  })
  .then(person => {
    assert.ok(person instanceof Resource, 'first person is a resource');
    assert.end();
  })
  .catch(err => {
    assert.fail(err);
  });
});

test('create third animal', assert => {
  animal.createResource({ age: 25, species: 'turtle', owner: 2 })
    .then(animal => {
      assert.ok(animal instanceof Resource, 'third animal is a Resource');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('log store', assert => {
  console.log(app.adapter.store);
  assert.end();
});

test('filter person older-than & younger-than', assert => {
  person.filter({ 'older-than': 50 })

  .then(people => {
    assert.ok(people instanceof ResourceArray, 'filtered people is a ResourceArray');
    assert.equal(people.resources.length, 1, 'filtered by age returned 1 user');
    assert.equal(people.resources[0].id, 2, 'filtered by age returned second user');

    return person.filter({ 'younger-than': 50 });
  })

  .then(people => {
    assert.ok(people instanceof ResourceArray, 'filtered people is a ResourceArray');
    assert.equal(people.resources.length, 1, 'filtered by age returned 1 user');
    assert.equal(people.resources[0].id, 1, 'filtered by age returned first user');

    return person.filter({ 'younger-than': 30, 'older-than': 20 });
  })

  .then(people => {
    assert.ok(people instanceof ResourceArray, 'filtered people is a ResourceArray');
    assert.equal(people.resources.length, 1, 'filtered by age returned 1 user');
    assert.equal(people.resources[0].id, 1, 'filtered by age returned first user');

    assert.end();
  });
});

test('filter animal owner older-than', assert => {
  animal.filter({ 'owner': { 'younger-than': 30, 'older-than': 20 } })

  .then(animals => {
    assert.ok(animals instanceof ResourceArray, 'filtered animals is a ResourceArray');
    assert.equal(animals.resources.length, 1, 'filtered by owner returned 1 animal');
    assert.equal(animals.resources[0].id, 2, 'filtered by owner returned second animal');

    assert.end();
  });
});
