import { expect } from 'chai';
import deepClone from '../../src/utils/deepClone';

describe('deepClone test', () => {
  let obj;

  beforeEach(() => {
    obj = {
      a: 'a',
      b: { b: 'b' },
      c: ['c'],
      d: { d: ['d'] },
      e: [{ e: 'e' }],
      f: { f: { f: { f: { f: 'f' } } } },
      g: [[[['g']]]],
    };
  });

  it('should clone primitives', () => {
    expect(deepClone(undefined)).to.deep.equal(undefined);
    expect(deepClone(null)).to.deep.equal(null);
    expect(deepClone(true)).to.deep.equal(true);
    expect(deepClone(0)).to.deep.equal(0);
    expect(deepClone('')).to.deep.equal('');
  });

  it('should clone arrays and objects', () => {
    const arr = [obj];

    expect(deepClone({})).to.deep.equal({});
    expect(deepClone(obj)).to.deep.equal(obj);

    expect(deepClone([])).to.deep.equal([]);
    expect(deepClone(arr)).to.deep.equal(arr);
  });

  it('shouldn\'t clone built-in objects', () => {
    const date = new Date();

    expect(deepClone(date)).to.not.deep.equal(date);
  });

  it('shouldn\'t modify the cloned object', () => {
    const clone = deepClone(obj);
    const serialization = JSON.stringify(obj);

    delete clone.a;
    expect(obj).to.deep.equal(JSON.parse(serialization));
  });
});
