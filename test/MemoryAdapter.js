import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Adapter from '../src/Adapter';
import MemoryAdapter from '../src/MemoryAdapter';

chai.use(chaiAsPromised);

describe('MemoryAdapter test', () => {
  const emptyMemoryAdapter = new MemoryAdapter();
  const store = {
    user: [
      {
        id: '1',
        age: 18,
        blogs: ['1'],
      }, {
        id: '2',
        age: 16,
      },
    ],
    blogs: [{}],
  };
  const populatedMemoryAdapter = new MemoryAdapter(store);

  describe('constructor', () => {
    it('should be an instace of Adapter', () => {
      expect(emptyMemoryAdapter).to.be.an.instanceof(Adapter);
    });
  });

  describe('#connect', () => {
    it('should always resolve to true', () =>
      expect(emptyMemoryAdapter.connect()).to.eventually.be.true
    );
  });

  describe('#disconnect', () => {
    it('should always resolve to true', () =>
      expect(emptyMemoryAdapter.disconnect()).to.eventually.be.true
    );
  });

  describe('#find', () => {
    it('should not get any records back from the empty memory adapter', () =>
      expect(emptyMemoryAdapter.find('user')).to.eventually.deep.equal([])
    );

    it('should get records back from the populated memory adapter', () =>
      expect(populatedMemoryAdapter.find('user')).to.eventually.deep.equal(store.user)
    );


    it('should return requested relationships', () => {
      const user = store.user.map(Object.assign.bind(null, {}));
      user[0].blog = store.blogs[0];

      return expect(populatedMemoryAdapter.find('user', ['blog'])).to.eventually.deep.equal(user);
    });

    it('should be able to get records by ids', () =>
      expect(populatedMemoryAdapter.find('user', [], { ids: ['1'] }))
        .to.eventually.deep.equal([store.user[0]])
    );

    it('should be able to paginate results', () =>
      expect(populatedMemoryAdapter.find('user', [], { page: { offset: 1, limit: 1 } }))
        .to.eventually.deep.equal([store.user[1]])
    );

    it('should be able to sort results', () =>
      expect(populatedMemoryAdapter.find({ sort: { age: 'desc' } }))
        .to.eventually.deep.equal([store.user[1], store.user[0]])
    );

    it('should return specified fields', () => {
      function removeAge(user) {
        const object = Object.assign({}, user);
        delete object.age;
        return object;
      }

      return expect(populatedMemoryAdapter.find({ fields: { age: false } }))
        .to.eventually.deep.equal([store.user.map(removeAge)]);
    });

    it('should be able to filter arbitrary fields and operators', () =>
      expect(populatedMemoryAdapter.find({ filter: { age: { $gte: 17 } } }))
        .to.eventually.deep.equal([store.user[0]])
    );
  });
});
