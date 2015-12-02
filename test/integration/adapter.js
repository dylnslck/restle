import Promise from 'bluebird';

export default (t, app, models) => new Promise(resolve => {
  const adapter = app.adapter;
  const { person, animal } = models;

  t.test('store should be empty object', assert => {
    assert.deepEqual(adapter.store, {});
    assert.end();
  });

  t.test('finding a person should return empty array', assert => {
    adapter.find(person).then(people => {
      assert.ok(Array.isArray(people), 'response is an array');
      assert.equal(people.length, 0, 'response array length is zero')
      assert.equal(people.count, 0, 'count property is zero');
      assert.end();
    });
  });

  t.test('create some people records', assert => {
    Promise.all([
      adapter.create(person, {
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }),

      adapter.create(person, {
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }),

      adapter.create(person, {
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }),
    ]).then(people => {
      assert.deepEqual(people, [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }], 'created resources have proper json');

      return adapter.find(person);
    }).then(people => {
      assert.ok(Array.isArray(people), 'response is an array');
      assert.equal(people.length, 3, 'response array length is 3')
      assert.equal(people.count, 3, 'count property is 3');
      assert.end();
    });
  });

  t.test('check ids', assert => {
    adapter.find(person, {
      ids: [1, 3],
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 2;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 2, 'retrieved records have count property of 2');
      assert.end();
    });
  });

  t.test('check filters primitive (1)', assert => {
    adapter.find(person, {
      filter: {
        age: 22
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });
  t.test('check filters primitive (2)', assert => {
    adapter.find(person, {
      filter: {
        age: 22,
        name: 'Bobby Jones'
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters primitive (3)', assert => {
    adapter.find(person, {
      filter: {
        age: 23
      },
    }).then(people => {
      const response = [];

      response.count = 0;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 0, 'retrieved records have count property of 0');
      assert.end();
    });
  });

  t.test('check filters complex (1)', assert => {
    adapter.find(person, {
      filter: {
        age: { $lt: 24 },
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (2)', assert => {
    adapter.find(person, {
      filter: {
        age: { $lte: 22, $gte: 22 },
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (3)', assert => {
    adapter.find(person, {
      filter: {
        age: { $gt: 24, $lt: 40 },
      },
    }).then(people => {
      const response = [{
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (4)', assert => {
    adapter.find(person, {
      filter: {
        age: { $gt: 40 },
      },
    }).then(people => {
      const response = [{
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (5)', assert => {
    adapter.find(person, {
      filter: {
        age: { $gt: 40, $lt: 100 },
        name: 'Big Joe',
      },
    }).then(people => {
      const response = [{
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (6)', assert => {
    adapter.find(person, {
      filter: {
        age: { $gt: 40 },
        name: 'Big Bob',
        email: 'joe@gmail.com',
      },
    }).then(people => {
      const response = [];

      response.count = 0;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 0, 'retrieved records have count property of 0');
      assert.end();
    });
  });

  t.test('check filters complex (7)', assert => {
    adapter.find(person, {
      filter: {
        name: {
          $in: [ 'Big Joe', 'Bobby Jones' ]
        },
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 2;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 2, 'retrieved records have count property of 2');
      assert.end();
    });
  });

  t.test('check filters complex (8)', assert => {
    adapter.find(person, {
      filter: {
        age: 92,
        name: {
          $in: [ 'Nobody' ]
        },
      },
    }).then(people => {
      const response = [];

      response.count = 0;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 0, 'retrieved records have count property of 0');
      assert.end();
    });
  });

  t.test('check filters complex (9)', assert => {
    adapter.find(person, {
      filter: {
        name(value) {
          return value.length > 10;
        },
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters complex (9)', assert => {
    adapter.find(person, {
      filter: {
        name(value) {
          return value.length > 20;
        },
      },
    }).then(people => {
      const response = [];

      response.count = 0;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 0, 'retrieved records have count property of 0');
      assert.end();
    });
  });

  t.test('check filters and ids (1)', assert => {
    adapter.find(person, {
      ids: [ 3 ],
      filter: {
        age: 92,
        name: {
          $in: [ 'Big Joe' ]
        },
      },
    }).then(people => {
      const response = [{
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 1;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 1, 'retrieved records have count property of 1');
      assert.end();
    });
  });

  t.test('check filters and ids (2)', assert => {
    adapter.find(person, {
      ids: [ 2 ],
      filter: {
        age: 92,
        name: {
          $in: [ 'Big Joe' ]
        },
      },
    }).then(people => {
      const response = [];

      response.count = 0;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 0, 'retrieved records have count property of 0');
      assert.end();
    });
  });

  t.test('apply sort (1)', assert => {
    adapter.find(person, {
      sort: {
        age: 'asc',
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply sort (2)', assert => {
    adapter.find(person, {
      sort: {
        age: 'desc',
      },
    }).then(people => {
      const response = [{
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply sort (3)', assert => {
    adapter.find(person, {
      sort: {
        name: 'asc',
      },
    }).then(people => {
      const response = [{
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply sort (4)', assert => {
    adapter.find(person, {
      sort: {
        name: 'desc',
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply sort (5)', assert => {
    adapter.find(person, {
      sort: {
        age: 'asc',
        name: 'desc',
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
        email: 'bjones@gmail.com',
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply fields (1)', assert => {
    adapter.find(person, {
      fields: {
        age: true,
      },
    }).then(people => {
      const response = [{
        id: 1,
        age: 22,
      }, {
        id: 2,
        age: 32,
      }, {
        id: 3,
        age: 92,
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('apply fields (2)', assert => {
    adapter.find(person, {
      fields: {
        age: true,
        name: true,
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        age: 22,
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('pagination (1)', assert => {
    adapter.find(person, {
      page: {
        offset: 0,
        limit: 4,
      },
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        email: 'bjones@gmail.com',
        age: 22,
      }, {
        id: 2,
        name: 'Billy Kid',
        email: 'bkid@gmail.com',
        age: 32,
      }, {
        id: 3,
        name: 'Big Joe',
        email: 'joe@gmail.com',
        age: 92,
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('pagination (2)', assert => {
    adapter.find(person, {
      page: {
        offset: 0,
        limit: 2,
      }
    }).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby Jones',
        email: 'bjones@gmail.com',
        age: 22,
      }, {
        id: 2,
        name: 'Billy Kid',
        email: 'bkid@gmail.com',
        age: 32,
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('pagination (3)', assert => {
    adapter.find(person, {
      page: {
        offset: 1,
        limit: 1,
      },
    }).then(people => {
      const response = [{
        id: 2,
        name: 'Billy Kid',
        email: 'bkid@gmail.com',
        age: 32,
      }];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('pagination (4)', assert => {
    adapter.find(person, {
      page: {
        offset: 3,
        limit: 10,
      },
    }).then(people => {
      const response = [];

      response.count = 3;
      assert.deepEqual(people, response, 'retrieved records have proper json');
      assert.equal(people.count, 3, 'retrieved records have count property of 3');
      assert.end();
    });
  });

  t.test('create an resource with to-one relationship', assert => {
    adapter.create(animal, {
      species: 'Dog',
      age: 10,
      owner: 1,
    }).then(animal => {
      const response = {
        id: 1,
        species: 'Dog',
        age: 10,
        owner: {
          id: 1,
          name: 'Bobby Jones',
          email: 'bjones@gmail.com',
          age: 22,
        },
      };

      assert.deepEqual(animal, response, 'created animal has proper json');
      assert.end();
    });
  });

  t.test('create an resource with to-many relationship', assert => {
    adapter.create(person, {
      name: 'Jumbo Bob',
      age: 45,
      pets: [ 1 ]
    }).then(person => {
      const response = {
        id: 4,
        name: 'Jumbo Bob',
        age: 45,
        pets: [{
          id: 1,
          species: 'Dog',
          age: 10,
          owner: 1,
        }],
      };

      assert.deepEqual(person, response, 'created resource has proper json');
      assert.end();
    });
  });

  t.test('update to-many relationship for a resource (1)', assert => {
    adapter.update(person, 1, {
      name: 'Bobby James',
      age: 23,
      pets: [ 1 ],
    }).then(person => {
      const response = {
        id: 1,
        name: 'Bobby James',
        email: 'bjones@gmail.com',
        age: 23,
        pets: [{
          id: 1,
          species: 'Dog',
          age: 10,
          owner: 1,
        }],
      };

      assert.deepEqual(person, response, 'updates resource has proper json');
      assert.end();
    });
  });

  t.test('retrieve', assert => {
    adapter.retrieve(person).then(people => {
      const response = [{
        id: 1,
        name: 'Bobby James',
        age: 23,
        email: 'bjones@gmail.com',
        pets: [ 1 ],
      }, {
        id: 2,
        name: 'Billy Kid',
        age: 32,
        email: 'bkid@gmail.com',
      }, {
        id: 3,
        name: 'Big Joe',
        age: 92,
        email: 'joe@gmail.com',
      }, {
        id: 4,
        name: 'Jumbo Bob',
        age: 45,
        pets: [ 1 ],
      }];

      assert.deepEqual(people, response, 'retrieved resources have proper json');
      assert.end();
    });
  });

  t.test('update to-many relationship for a resource (2)', assert => {
    adapter.update(person, 1, {
      pets: [],
    }).then(person => {
      const response = {
        id: 1,
        name: 'Bobby James',
        email: 'bjones@gmail.com',
        age: 23,
        pets: [],
      };

      assert.deepEqual(person, response, 'updates resource has proper json');
      assert.end();
    });
  });

  t.test('update to-one relationship for a resource (1)', assert => {
    adapter.update(animal, 1, {
      id: 1,
      species: 'Dog',
      age: 10,
      owner: null,
    }).then(animal => {
      const response = {
        id: 1,
        species: 'Dog',
        age: 10,
      };

      assert.deepEqual(animal, response, 'updated resource has proper json');
      assert.end();
    });
  });

  t.test('delete record (1)', assert => {
    adapter.find(animal).then(animals => {
      assert.equal(animals.length, 1, 'found one animal');
      assert.equal(animals[0].id, 1, 'first animal id is 1');

      return adapter.delete(animal, 1);
    }).then(success => {
      assert.ok(success, 'adapter deletion response is a success');

      return adapter.find(animal);
    }).then(animals => {
      assert.equal(animals.length, 0, 'found zero animals');
      assert.end();
    });
  });

  t.test('delete record (2)', assert => {
    adapter.find(person).then(people => {
      assert.equal(people.length, 4, 'found four people');
      assert.equal(people[1].id, 2, 'second person id is 2');

      return adapter.delete(person, 2);
    }).then(success => {
      assert.ok(success, 'adapter deletion response is a success');

      return adapter.find(person);
    }).then(people => {
      assert.equal(people.length, 3, 'found three people');

      for (let p of people)
        assert.ok(p.id !== 2, `person with id ${p.id} is not 2`);

      assert.end();
    });
  });

  t.test('clear store and finish', assert => {
    adapter.store = {};
    assert.equal(Object.keys(adapter.store).length, 0, 'store is cleared');
    assert.pass('done');
    resolve(true);
  });
});
