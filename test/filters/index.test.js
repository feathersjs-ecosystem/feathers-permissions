import { expect } from 'chai';
import filters from '../../src/filters';

describe('filters', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/filters')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof filters).to.equal('object');
  });

  it('exposes isPermitted hook', () => {
    expect(typeof filters.isPermitted).to.equal('function');
  });

  it('exposes checkPermissions hook', () => {
    expect(typeof filters.checkPermissions).to.equal('function');
  });
});
