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

test('find all people', assert => {
  person.find()
    .then(people => {
      assert.ok(people instanceof ResourceArray, 'people are a ResourceArray');
      assert.deepEqual(people.serialize(), {
        links: {
          self: '/api/people',
        },
        data: [],
        included: [],
      }, 'people json looks good');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

// test createResource without relationships
test('create billy and spot', assert => {
  const billy = person.createResource({ name: 'Billy', email: 'b@e.com' });
  const spot = animal.createResource({ name: 'Spot', color: 'black and white' });

  Promise.all([billy, spot])
    .then(resources => {
      assert.ok(resources[0] instanceof Resource, 'billy is a resource');
      assert.ok(resources[1] instanceof Resource, 'spot is a resource');

      assert.deepEqual(resources[0].serialize(), {
        links: {
          self: '/api/people/1'
        },
        data: {
          id: '1',
          type: 'person',
          attributes: {
            name: 'Billy',
            email: 'b@e.com',
          },
          relationships: {
            pets: {
              data: [],
              links: {
                related: '/api/people/1/pets',
                self: '/api/people/1/relationships/pets',
              },
            },
          },
        },
        included: [],
      }, 'serialized billy has good looking json');

      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

// test createResource with to-one and to-many relationships
test('create jimmy and lucy', assert => {
  const jimmy = person.createResource({ name: 'Jimmy', email: 'j@e.com', pets: [1] });
  const lucy = animal.createResource({ name: 'Lucy', color: 'gold', owner: 1 });

  Promise.all([jimmy, lucy])
    .then(resources => {
      assert.ok(resources[0] instanceof Resource, 'jimmy is a resource');
      assert.ok(resources[1] instanceof Resource, 'lucy is a resource');

      assert.deepEqual(resources[0].serialize(), {
        links: {
          self: '/api/people/2'
        },
        data: {
          id: '2',
          type: 'person',
          attributes: {
            name: 'Jimmy',
            email: 'j@e.com',
          },
          relationships: {
            pets: {
              data: [{
                type: 'animal',
                id: '1',
              }],
              links: {
                related: '/api/people/2/pets',
                self: '/api/people/2/relationships/pets',
              },
            },
          },
        },
        included: [{
          type: 'animal',
          id: '1',
          attributes: {
            name: 'Spot',
            color: 'black and white',
          },
          links: {
            self: '/api/animals/1',
          },
        }],
      }, 'serialized jimmy has good looking json');

      assert.deepEqual(resources[1].serialize(), {
        links: {
          self: '/api/animals/2'
        },
        data: {
          id: '2',
          type: 'animal',
          attributes: {
            name: 'Lucy',
            color: 'gold',
          },
          relationships: {
            owner: {
              data: {
                type: 'person',
                id: '1',
              },
              links: {
                related: '/api/animals/2/owner',
                self: '/api/animals/2/relationships/owner',
              },
            },
          },
        },
        included: [{
          type: 'person',
          id: '1',
          attributes: {
            name: 'Billy',
            email: 'b@e.com',
          },
          links: {
            self: '/api/people/1',
          },
        }],
      }, 'serialized lucy has good looking json');

      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test(`get resource with to-one relationship`, assert => {
  animal.findResource(2)
    .then(lucy => {
      assert.ok(lucy instanceof Resource, 'lucy is a resource');
      assert.deepEqual(lucy.serialize(), {
        links: {
          self: '/api/animals/2',
        },
        data: {
          id: '2',
          type: 'animal',
          attributes: {
            color: 'gold',
            name: 'Lucy',
          },
          relationships: {
            owner: {
              data: {
                type: 'person',
                id: '1',
              },
              links: {
                self: '/api/animals/2/relationships/owner',
                related: '/api/animals/2/owner',
              },
            },
          },
        },
        included: [{
          type: 'person',
          id: '1',
          attributes: {
            name: 'Billy',
            email: 'b@e.com',
          },
          links: {
            self: '/api/people/1',
          },
        }],
      }, 'serialized lucy has good looking json');
      assert.end();
    })
    .catch(err => {
      ssert.fail(err);
    });
});

test(`get resource with to-many relationship`, assert => {
  person.findResource(2)
    .then(jimmy => {
      assert.ok(jimmy instanceof Resource, 'jimmy is a resource');
      assert.deepEqual(jimmy.serialize(), {
        links: {
          self: '/api/people/2',
        },
        data: {
          id: '2',
          type: 'person',
          attributes: {
            email: 'j@e.com',
            name: 'Jimmy',
          },
          relationships: {
            pets: {
              data: [{
                type: 'animal',
                id: '1',
              }],
              links: {
                self: '/api/people/2/relationships/pets',
                related: '/api/people/2/pets',
              },
            },
          },
        },
        included: [{
          type: 'animal',
          id: '1',
          attributes: {
            name: 'Spot',
            color: 'black and white',
          },
          links: {
            self: '/api/animals/1',
          },
        }],
      }, 'serialized jimmy has good looking json');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test(`get related to-one`, assert => {
  animal.findRelated(2, 'owner')
    .then(owner => {
      assert.ok(owner instanceof Resource, `lucy's owner is a resource`);
      assert.deepEqual(owner.serialize(), {
        links: {
          self: '/api/animals/2/owner',
        },
        data: {
          id: '1',
          type: 'person',
          attributes: {
            name: 'Billy',
            email: 'b@e.com',
          },
          relationships: {
            pets: {
              data: [],
              links: {
                self: '/api/people/1/relationships/pets',
                related: '/api/people/1/pets',
              },
            },
          },
        },
        included: [],
      }, `lucy's serialized owner has good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test(`get related to-many`, assert => {
  person.findRelated(2, 'pets')
    .then(pets => {
      assert.ok(pets instanceof ResourceArray, `jimmy's pets is a resource array`);
      assert.deepEqual(pets.serialize(), {
        links: {
          self: '/api/people/2/pets',
        },
        data: [{
          id: '1',
          type: 'animal',
          attributes: {
            name: 'Spot',
            color: 'black and white',
          },
          relationships: {
            owner: {
              data: null,
              links: {
                self: '/api/animals/1/relationships/owner',
                related: '/api/animals/1/owner',
              },
            },
          },
        }],
        included: [],
      }, `jimmy's serialized pets have good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-one', assert => {
  animal.findRelationship(2, 'owner')
    .then(owner => {
      assert.ok(owner instanceof Relationship, `lucy's owner is a relationship`);
      assert.deepEqual(owner.serialize(), {
        links: {
          self: '/api/animals/2/relationships/owner',
          related: '/api/animals/2/owner',
        },
        data: {
          type: 'person',
          id: '1',
        },
      }, `lucy's serialized owner relationship has good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-many', assert => {
  person.findRelationship(2, 'pets')
    .then(pets => {
      assert.ok(pets instanceof Relationship, `jimmy's pets are a relationship`);
      assert.deepEqual(pets.serialize(), {
        links: {
          self: '/api/people/2/relationships/pets',
          related: '/api/people/2/pets',
        },
        data: [{
          type: 'animal',
          id: '1',
        }],
      }, `jimmy's serialized pets relationship has good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('append to-many relationship', assert => {
  animal.findResource(2)
    .then(lucy => {
      assert.ok(lucy instanceof Resource, 'lucy is a resource');

      person.findRelationship(2, 'pets')
        .then(pets => {
          assert.ok(pets instanceof Relationship, 'pets are a relationship');

          pets.append(lucy)
            .then(success => {
              assert.ok('success', 'added lucy to jimmy pets relationship');
              assert.end();
            })
            .catch(err => {
              assert.fail(err);
            });
        })
        .catch(err => {
          assert.fail(err);
        });
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-many (again)', assert => {
  person.findRelationship(2, 'pets')
    .then(pets => {
      assert.ok(pets instanceof Relationship, 'pets are a relationship');
      assert.deepEqual(pets.serialize(), {
        links: {
          self: '/api/people/2/relationships/pets',
          related: '/api/people/2/pets',
        },
        data: [
          {
            type: 'animal',
            id: '1',
          },
          {
            type: 'animal',
            id: '2',
          },
        ],
      }, 'serialized pets relationship looks good and has two items');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('set to-one relationship', assert => {
  person.findResource(1)
    .then(billy => {
      animal.findRelationship(1, 'owner')
        .then(owner => {
          assert.ok(owner instanceof Relationship, 'owner is a relationship');
          owner.set(billy)
            .then(success => {
              assert.ok(success, 'billy successfully set as the owner');
              assert.end();
            })
            .catch(err => {
              assert.fail(err);
            });
        })
        .catch(err => {
          assert.fail(err);
        });
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-one (again)', assert => {
  animal.findRelationship(1, 'owner')
    .then(owner => {
      assert.ok(owner instanceof Relationship, `spot's owner is a relationship`);
      assert.deepEqual(owner.serialize(), {
        links: {
          self: '/api/animals/1/relationships/owner',
          related: '/api/animals/1/owner',
        },
        data: {
          type: 'person',
          id: '1',
        },
      }, `spot's serialized owner relationship has good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('remove to-one relationship', assert => {
  animal.findRelationship(1, 'owner')
    .then(owner => {
      assert.ok(owner instanceof Relationship, `spot's owner is a relationship`);
      owner.remove()
        .then(success => {
          assert.ok(success, `spot's owner was removed`);
          assert.end();
        })
        .catch(err => {
          assert.fail(err);
        });
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-one (again again)', assert => {
  animal.findRelationship(1, 'owner')
    .then(owner => {
      assert.ok(owner instanceof Relationship, `spot's owner is a relationship`);
      assert.deepEqual(owner.serialize(), {
        links: {
          self: '/api/animals/1/relationships/owner',
          related: '/api/animals/1/owner',
        },
        data: null,
      }, `spot's serialized owner relationship has good looking json`);
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('delete relationships to-many', assert => {
  person.findRelationship(2, 'pets')
    .then(pets => {
      assert.ok(pets instanceof Relationship, 'pets are a relationship');
      pets.deleteMany([1, 2])
        .then(success => {
          assert.ok('success', 'pets have been deleted');
          assert.end();
        })
        .catch(err => {
          assert.fail(err);
        });
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('get relationships to-many (again again)', assert => {
  person.findRelationship(2, 'pets')
    .then(pets => {
      assert.ok(pets instanceof Relationship, 'pets are a relationship');
      assert.deepEqual(pets.serialize(), {
        links: {
          self: '/api/people/2/relationships/pets',
          related: '/api/people/2/pets',
        },
        data: [],
      }, 'serialized pets relationship looks good and has two items');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('update billy', assert => {
  person.updateResource(1, {
    name: 'Johnny',
  }).then(success => {
    assert.ok(success, 'updating billy returned a success');

    person.findResource(1).then(billy => {
      assert.ok(billy instanceof Resource, 'billy is indeed a resource');
      assert.deepEqual(billy.serialize(), {
        links: {
          self: '/api/people/1',
        },
        data: {
          id: '1',
          type: 'person',
          attributes: {
            name: 'Johnny',
            email: 'b@e.com',
          },
          relationships: {
            pets: {
              links: {
                self: '/api/people/1/relationships/pets',
                related: '/api/people/1/pets',
              },
              data: [],
            },
          },
        },
        included: [],
      }, 'billy serialized json looks good');
      assert.end();
    });
  });
});

test('delete billy', assert => {
  person.deleteResource(1)
    .then(success => {
      assert.ok(success, 'billy was apparently deleted');
      assert.end();
    })
    .catch(err => {
      assert.fail(err);
    });
});

test('try and find billy', assert => {
  person.findResource(1)
    .catch(err => {
      assert.equal(err, 'Resource not found.');
      assert.end();
      app.disconnect();
    });
});
