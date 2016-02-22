/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import didFilterPass from '../../src/utils/didFilterPass';

describe('didFilterPass test', () => {
  const eighteen = { age: 18 };
  const sixteen = { age: 16 };
  const filter = { age: 18 };

  it('should return true when passed no filter', () => {
    expect(didFilterPass(eighteen)).to.be.true;
  });

  it('should return true when the input object passes the filter', () => {
    expect(didFilterPass(eighteen, filter)).to.be.true;
  });

  it('should return false when the input object fails the filter', () => {
    expect(didFilterPass(sixteen, filter)).to.be.false;
  });
});
