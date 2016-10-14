import { expect } from 'chai';
import middleware from '../../src/middleware';

describe('middleware', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/middleware')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof middleware).to.equal('object');
  });

  it('exposes checkPermissions', () => {
    expect(typeof middleware.checkPermissions).to.equal('function');
  });

  it('exposes isPermitted', () => {
    expect(typeof middleware.isPermitted).to.equal('function');
  });
});
