import { expect } from 'chai';
import hooks from '../../src/hooks';

describe('hooks', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/hooks')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof hooks).to.equal('object');
  });

  it('exposes isPermitted hook', () => {
    expect(typeof hooks.isPermitted).to.equal('function');
  });

  it('exposes checkPermissions hook', () => {
    expect(typeof hooks.checkPermissions).to.equal('function');
  });
});
