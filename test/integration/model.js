import Resource from '../../../dist/lib/model/resource';
import Relationship from '../../../dist/lib/model/relationship';
import ResourceArray from '../../../dist/lib/model/resource-array';
import Promise from 'bluebird';

export default (t, app) => new Promise(resolve => {
  t.test(`app.model('person').find`, assert => {
    app.model('person').find().then(people => {
      assert.ok(people instanceof ResourceArray, 'found people is a resource array');
      assert.equal(people.resources.length, 0, 'no people were found');
      assert.equal(people.count, 0, 'count property is zero');
      assert.end();
    });
  });

  t.test(`app.model.create`, assert => {
    app.model('person').create({
      name: 'Bobby Jones',
      age: 22,
      email: 'bjones@gmail.com',
    }).then(person => {
      assert.ok(person instanceof Resource, 'created person is a resource');
      assert.equal(person.get('name'), 'Bobby Jones', 'name attribute is good');
      assert.equal(person.get('email'), 'bjones@gmail.com', 'email attribute is good');
      assert.equal(person.get('age'), 22, 'age attribute is good');

      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'person pets is a resource array');
      assert.equal(pets.length, 0, 'person pets has zero length');

      return app.model('animal').create({
        species: 'Dog',
        age: 10,
        owner: 1,
      });
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'created animal is a resource');
      assert.equal(animal.get('species'), 'Dog', 'species attribute is good');
      assert.equal(animal.get('age'), 10, 'age attribute is good');

      return animal.get('owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'animal owner is a resource');
      assert.equal(owner.get('name'), 'Bobby Jones', 'animal owner name attribute is good');
      assert.equal(owner.get('email'), 'bjones@gmail.com', 'animal owner email attribute is good');
      assert.equal(owner.get('age'), 22, 'animal owner age attribute is good');

      return app.model('person').create({
        name: 'Joe',
        age: 45,
        email: 'joe@gmail.com',
        pets: [ 1 ],
      });
    }).then(person => {
      assert.ok(person instanceof Resource, 'person is a resource');

      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'person pets is a resource array');
      assert.equal(pets.length, 1, 'person pets has length of 1');
      assert.end();
    });
  });

  t.test(`app.model.findOne`, assert => {
    return app.model('person').findOne({
      filter: { name: 'Joe' },
    }).then(person => {
      assert.ok(person instanceof Resource, 'found one person is a resource');

      return app.model('person').findOne({
        filter: { name: 'IDontExist' },
      });
    }).then(person => {
      assert.equal(person, null, 'found person does not exist');
      assert.end();
    })
  })

  t.test(`app.model.update`, assert => {
    app.model('animal').update(1, {
      age: 11,
      owner: 2,
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'updated animal is a resource');
      assert.equal(animal.get('species'), 'Dog', 'species attribute is good');
      assert.equal(animal.get('age'), 11, 'age attribute is good');

      return animal.get('owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'animal owner is a resource');
      assert.equal(owner.get('name'), 'Joe', 'animal owner name attribute is good');
      assert.equal(owner.get('email'), 'joe@gmail.com', 'animal owner email attribute is good');
      assert.equal(owner.get('age'), 45, 'animal owner age attribute is good');

      return app.model('animal').update(1, {
        owner: null,
      });
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'updated animal is a resource');
      assert.equal(animal.get('species'), 'Dog', 'species attribute is good');
      assert.equal(animal.get('age'), 11, 'age attribute is good');

      return animal.get('owner');
    }).then(owner => {
      assert.equal(owner, null, 'owner is null');

      return app.model('person').update(2, {
        pets: [],
      });
    }).then(person => {
      assert.ok(person instanceof Resource, 'person is a resource');
      assert.equal(person.get('name'), 'Joe', 'person name attribute is good');
      assert.equal(person.get('email'), 'joe@gmail.com', 'person email attribute is good');
      assert.equal(person.get('age'), 45, 'person age attribute is good');

      return person.get('pets');
    }).then(pets => {
      assert.deepEqual(pets.resources, [], 'pets is an empty array');
      assert.end();
    });
  });

  t.test(`app.model.delete`, assert => {
    app.model('animal').delete(1).then(success => {
      assert.ok(success, 'success is true');
      assert.equal(app.adapter.store.animal.length, 0, 'animals deleted from store');

      return Promise.all([
        app.model('person').delete(1),
        app.model('person').delete(2)
      ]);
    }).then(deletions => {
      assert.deepEqual(deletions, [ true, true ], 'both successes are true');
      assert.equal(app.adapter.store.person.length, 0, 'animals deleted from store');
      assert.end();
    });
  });

  t.test(`app.model.create animal with undefined owner`, assert => {
    app.model('animal').create({
      species: 'Cat',
      age: 5,
      owner: 1,
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'created animal is a resource');
      return animal.get('owner');
    }).then(owner => {
      assert.equal(owner, null, 'owner is null');
      assert.end();
    });
  });

  t.test(`resource.update and resource.delete`, assert => {
    app.model('animal').findResource(1).then(animal => {
      assert.ok(animal instanceof Resource, 'found animal is a resource');
      assert.equal(animal.attribute('species'), 'Cat', 'species attribute looks good');
      assert.equal(animal.attribute('age'), 5, 'species attribute looks good');

      return animal.update({ species: 'Lion' });
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'found animal is a resource');
      assert.equal(animal.attribute('species'), 'Lion', 'species attribute looks good');
      assert.equal(animal.attribute('age'), 5, 'species attribute looks good');

      return animal.delete();
    }).then(success => {
      assert.equal(success, true, 'animal resource deleted');
      assert.equal(app.adapter.store.animal.length, 0, 'no animals in the store');
      assert.end();
    });
  });

  t.test('app.model.create person', assert => {
    app.model('person').create({
      name: 'Eric Smith',
      age: 30,
      pets: [ 1 ],
    }).then(person => {
      assert.ok(person instanceof Resource, 'created person is a resource');

      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 0, 'no pets are there');

      return app.model('person').findResource(1);
    }).then(person => {
      return person.update({ pets: [] });
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 0, 'no pets are there');
      assert.deepEqual(app.adapter.store.person[0].pets, [], 'pets is an empty array in the store');

      return app.model('person').create({
        name: 'Peyton Manning',
        age: 39,
        pets: [],
      });
    }).then(person => {
      assert.end();
    });
  });

  t.test(`app.model.relationship (1)`, assert => {
    app.model('animal').create({
      species: 'Elephant',
      age: 22,
      owner: 1,
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'created animal is a resource');
      return animal.get('owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'owner is a resource');
      assert.equal(owner.attribute('name'), 'Eric Smith', 'owner name attribute looks good');
      assert.equal(owner.attribute('age'), 30, 'owner age attribute looks good');

      return app.model('animal').findResource(1);
    }).then(animal => {
      const owner = animal.relationship('owner');
      assert.ok(owner instanceof Relationship, 'owner is a relationship');

      return owner.set([ 2 ]);
    }).catch(err => {
      assert.ok(err, 'there was an error setting the owner as an array');
      assert.end();
    });
  });

  t.test(`app.model.relationship (2)`, assert => {
    app.model('animal').findResource(1).then(animal => {
      return animal.relationship('owner').set(2);
    }).then(animal => {
      assert.ok(animal instanceof Resource, 'updated animal is a resource');
      assert.equal(animal.attribute('species'), 'Elephant', 'species attribute looks good');

      return animal.get('owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'owner is a resource');
      assert.equal(owner.attribute('name'), 'Peyton Manning', 'owner name attribute looks good');
      assert.equal(owner.attribute('age'), 39, 'owner age attribute looks good');

      return Promise.props({
        person: app.model('person').findResource(1),
        animal: app.model('animal').findResource(1),
      });
    }).then(({ person, animal }) => {
      assert.ok(person instanceof Resource, 'person is a resource');
      assert.ok(animal instanceof Resource, 'animal is a resource');

      return animal.set('owner', person);
    }).then(animal => {
      return animal.get('owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'owner is a resource');
      assert.equal(owner.attribute('name'), 'Eric Smith', 'owner name attribute looks good');
      assert.equal(owner.attribute('age'), 30, 'owner age attribute looks good');

      return owner.delete();
    }).then(success => {
      assert.equal(success, true, 'owner deleted');

      return app.model('animal').findResource(1);
    }).then(animal => {
      return animal.get('owner');
    }).then(owner => {
      assert.equal(owner, null, 'the owner is deleted');
      assert.end();
    });
  });

  t.test(`app.model.relationship (3)`, assert => {
    app.model('person').findResource(2).then(person => {
      return person.set('pets', 1);
    }).catch(err => {
      assert.ok(err, 'cannot set a to-many relationship with a single value');
      assert.end();
    });
  });

  t.test(`app.model.relationship (4)`, assert => {
    app.model('person').findResource(2).then(person => {
      return person.set('pets', [ 1 ]);
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 1, 'there is one pet');

      return app.model('person').update(2, { pets: [] });
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 0, 'no more pets');

      return app.model('person').findResource(2);
    }).then(person => {
      return person.relationship('pets').append(1);
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 1, 'there is one pet');

      return app.model('person').update(2, { pets: [] });
    }).then(person => {
      assert.end();
    });
  });

  t.test(`app.model.relationship (5)`, assert => {
    Promise.props({
      person: app.model('person').findResource(2),
      animals: app.model('animal').find(),
    }).then(({ person, animals }) => {
      return person.set('pets', animals);
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 1, 'there is one pet');

      return app.model('person').update(2, { pets: [] });
    }).then(person => {
      assert.end();
    });
  });

  t.test(`app.model.relationship (6)`, assert => {
    Promise.props({
      person: app.model('person').findResource(2),
      animals: app.model('animal').find(),
    }).then(({ person, animals }) => {
      return person.relationship('pets').append(animals);
    }).then(person => {
      return person.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'pets is a resource array');
      assert.equal(pets.resources.length, 1, 'there is one pet');

      return app.model('person').update(2, { pets: [] });
    }).then(person => {
      app.adapter.store = {};
      assert.equal(Object.keys(app.adapter.store).length, 0, 'store is cleared');
      assert.end();
    });
  });

  t.test(`app.model.findRelated`, assert => {
    Promise.all([
      app.model('person').create({ name: 'Bob', age: 22, pets: [ 1, 2 ] }),
      app.model('person').create({ name: 'Jim', age: 26, pets: [ 2 ] }),
      app.model('animal').create({ species: 'Aardvark', age: 4, owner: 1 }),
      app.model('animal').create({ species: 'Zebra', age: 14, owner: 2 }),
    ]).then(records => {
      assert.equal(records.length, 4, 'four records were created');
      assert.equal(app.adapter.store.person.length, 2, 'two people created');
      assert.equal(app.adapter.store.animal.length, 2, 'two animals created');

      return app.model('person').findRelated(1, 'pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'related pets is a resource array');
      assert.equal(pets.resources.length, 2, 'two pets were found');

      return app.model('person').findRelated(1, 'pets', {
        filter: {
          age: { $gte: 14 },
        },
      });
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'related pets is a resource array');
      assert.equal(pets.resources.length, 1, 'only one pet was found this time');
      assert.equal(pets.resources[0].attribute('species'), 'Zebra', 'filtered animal is a Zebra');

      return app.model('animal').findRelated(1, 'owner');
    }).then(owner => {
      assert.ok(owner instanceof Resource, 'related owner is a resource');
      assert.equal(owner.attribute('name'), 'Bob', 'related owner name attribute is good');
      assert.equal(owner.attribute('age'), 22, 'related owner name attribute is good');

      return owner.get('pets');
    }).then(pets => {
      assert.ok(pets instanceof ResourceArray, 'related pets is a resource array');
      assert.equal(pets.resources.length, 2, 'two pets was found this time');
      app.adapter.store = {};
      assert.end();
    });
  });

  t.test(`app.model.get`, assert => {
    Promise.all([
      app.model('person').create({ name: 'Bob', age: 22, pets: [ 1 ], company: 1 }),
      app.model('animal').create({ species: 'Snake', age: 10, owner: 1, habitats: [ 1 ] }),
      app.model('habitat').create({ name: 'Tropical', countries: [ 1 ] }),
      app.model('country').create({ name: 'Brazil' }),
      app.model('country').create({ name: 'USA' }),
      app.model('company').create({ name: 'Apple', industry: 'Computers', employees: [ 1 ], office: 1 }),
      app.model('building').create({ size: 10, location: 2 })
    ]).then(results => {
      assert.equal(results.length, 7, 'seven records were created');

      return app.model('person').findRelated(1, 'company');
    }).then(company => {
      assert.ok(company instanceof Resource, 'related company is a resource');
      assert.equal(company.attribute('name'), 'Apple', 'company name attribute is good');
      assert.equal(company.attribute('industry'), 'Computers', 'company computers attribute is good');

      return company.get('office');
    }).then(office => {
      assert.ok(office instanceof Resource, 'related office is a resource');
      assert.equal(office.attribute('size'), 10, 'company name attribute is good');

      return office.get('location');
    }).then(location => {
      assert.ok(location instanceof Resource, 'related location is a resource');
      assert.equal(location.attribute('name'), 'USA', 'location name attribute is good');
      app.adapter.store = {};
      assert.end();
    });
  });

  t.test(`app.resoure.serialize (1)`, assert => {
    app.model('person').create({
      name: 'Jimbo',
      age: 21,
    }).then(person => {
      return app.model('company').create({
        name: 'Apple',
        industry: 'Computers',
        employees: [ 1 ],
      });
    }).then(company => {
      return app.model('person').update(1, {
        company: 1,
      });
    }).then(person => {
      const serialize = person.serialize();

      assert.deepEqual(serialize, {
        links: {
          self: `/people/1`,
        },
        data: {
          id: '1',
          type: 'person',
          attributes: {
            name: 'Jimbo',
            age: 21,
          },
          relationships: {
            pets: {
              links: {
                self: `/people/1/relationships/pets`,
                related: `/people/1/pets`,
              },
              data: [],
            },
            company: {
              links: {
                self: `/people/1/relationships/company`,
                related: `/people/1/company`,
              },
              data: {
                type: 'company',
                id: '1',
              },
            },
          },
        },
        included: [{
          id: '1',
          type: 'company',
          links: {
            self: `/companies/1`,
          },
          attributes: {
            name: 'Apple',
            industry: 'Computers',
          },
          relationships: {
            employees: {
              data: [{
                id: '1',
                type: 'person',
              }],
            },
            office: {
              data: null,
            },
          },
        }],
      }, 'serialized person has proper json');
      app.adapter.store = {};
      assert.end();
    });
  });

  t.test(`app.resoure.serialize (2)`, assert => {
    Promise.all([
      app.model('person').create({ name: 'Jimbo', age: 21, company: 1 }),
      app.model('company').create({ name: 'Apple', industry: 'Computers', employees: [ 1 ] })
    ]).then(results => {
      assert.equal(results.length, 2, 'two resources created');
      assert.deepEqual(results[0].serialize(), {
        links: {
          self: `/people/1`,
        },
        data: {
          id: '1',
          type: 'person',
          attributes: {
            name: 'Jimbo',
            age: 21,
          },
          relationships: {
            pets: {
              links: {
                self: `/people/1/relationships/pets`,
                related: `/people/1/pets`,
              },
              data: [],
            },
            company: {
              links: {
                self: `/people/1/relationships/company`,
                related: `/people/1/company`,
              },
              data: {
                type: 'company',
                id: '1',
              },
            },
          },
        },
        included: [{
          id: '1',
          type: 'company',
          attributes: {
            name: 'Apple',
            industry: 'Computers',
          },
          relationships: {
            pets: {
              data: [{
                id: '1',
                type: 'person',
              }],
            },
          },
        }],
      }, 'serialized person has proper json');
      assert.end();
    });
  });

  t.test('finish', assert => {
    app.adapter.store = {};
    assert.equal(Object.keys(app.adapter.store).length, 0, 'store is cleared');
    resolve(true);
  });
});
