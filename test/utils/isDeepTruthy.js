/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import isDeepTruthy from '../../src/utils/isDeepTruthy';

describe('isDeepTruthy test', () => {
  it('should return false if passed no arguments', () => {
    expect(isDeepTruthy()).to.be.false;
  });

  it('should return input\'s boleanness if passed a primitive', () => {
    expect(isDeepTruthy(undefined)).to.be.false;
    expect(isDeepTruthy(null)).to.be.false;
    expect(isDeepTruthy(true)).to.be.true;
    expect(isDeepTruthy(false)).to.be.false;
    expect(isDeepTruthy(-Infinity)).to.be.true;
    expect(isDeepTruthy(-1)).to.be.true;
    expect(isDeepTruthy(-0)).to.be.false;
    expect(isDeepTruthy(0)).to.be.false;
    expect(isDeepTruthy(1)).to.be.true;
    expect(isDeepTruthy(Infinity)).to.be.true;
    expect(isDeepTruthy(NaN)).to.be.false;
    expect(isDeepTruthy('')).to.be.false;
    expect(isDeepTruthy('foo')).to.be.true;
    expect(isDeepTruthy(Object)).to.be.true;
  });

  it('should return true if passed empty containers', () => {
    expect(isDeepTruthy([])).to.be.true;
    expect(isDeepTruthy({})).to.be.true;
  });

  it('should return true if there are no falsy deep values', () => {
    expect(isDeepTruthy([
      true,
      { foo: true, bar: {}, baz: [] },
    ])).to.be.true;
  });

  it('should return false if there is a falsy deep value', () => {
    expect(isDeepTruthy([
      true,
      { foo: true, bar: {}, baz: [0] },
    ])).to.be.false;
  });
});
