import { expect } from 'chai';
import Adapter from '../src/Adapter';
import MemoryAdapter from '../src/MemoryAdapter';

describe('MemoryAdapter test', () => {
  describe('constructor', () => {
    it('should be an instace of Adapter', () => {
      const emptyMemoryAdapter = new MemoryAdapter();

      expect(emptyMemoryAdapter).to.be.an.instanceof(Adapter);
    });
  });
});
