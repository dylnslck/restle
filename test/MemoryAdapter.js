import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Adapter from '../src/Adapter';
import MemoryAdapter from '../src/MemoryAdapter';

chai.use(chaiAsPromised);

describe('MemoryAdapter test', () => {
  const schemas = {
    user: {
      attributes: {
        age: { type: 'number' },
        content: { type: 'string' },
      },
      relationships: {
        blogs: { type: 'blog', multiplicity: 'many' },
      },
    },
    blog: {
      attributes: {
        title: { type: 'string' },
        content: { type: 'string' },
      },
      relationships: {
        author: { type: 'user', multiplicity: 'one' },
      },
    },
  };

  const store = {
    user: [{
      id: '1',
      age: 18,
      blogs: ['1'],
    }, {
      id: '2',
      age: 16,
    }],
    blog: [{
      id: '1',
      title: 'How to build an MVP',
      content: 'First step is to talk to users...',
    }],
  };

  const emptyMemoryAdapter = new MemoryAdapter(schemas);
  const populatedMemoryAdapter = new MemoryAdapter(schemas, store);

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
    it('should not get any records back from the empty memory adapter', () => {
      const expected = [];

      expected.count = 0;
      return expect(emptyMemoryAdapter.find('user')).to.eventually.deep.equal(expected);
    });

    it('should get records back from the populated memory adapter', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: ['1'],
      }, {
        id: '2',
        age: 16,
      }];

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user')).to.eventually.deep.equal(expected);
    });

    it('should populate relationships', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }, {
        id: '2',
        age: 16,
      }];

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs']))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to get records by ids', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }];

      expected.count = 1;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], { ids: ['1'] }))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to paginate results with no offset and no limit', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }, {
        id: '2',
        age: 16,
      }];

      const options = {
        page: {},
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to paginate results with a limit and with an offset', () => {
      const expected = [{
        id: '2',
        age: 16,
      }];

      const options = {
        page: { offset: 1, limit: 1 },
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to paginate results with only a limit', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }];

      const options = {
        page: { limit: 1 },
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to paginate results with only an offset', () => {
      const expected = [{
        id: '2',
        age: 16,
      }];

      const options = {
        page: { offset: 1 },
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to sort results', () => {
      const expected = [{
        id: '2',
        age: 16,
      }, {
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }];

      const options = {
        sort: { age: 'asc' },
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to exclude specified fields', () => {
      const expected = [{
        id: '1',
      }, {
        id: '2',
      }];

      const options = {
        fields: { age: false, blogs: false },
      };

      expected.count = 2;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });

    it('should be able to filter arbitrary fields and operators', () => {
      const expected = [{
        id: '1',
        age: 18,
        blogs: [{
          id: '1',
          title: 'How to build an MVP',
          content: 'First step is to talk to users...',
        }],
      }];

      const options = {
        filter: { age: { $gte: 17 } },
      };

      expected.count = 1;
      return expect(populatedMemoryAdapter.find('user', ['blogs'], options))
        .to.eventually.deep.equal(expected);
    });
  });
});
