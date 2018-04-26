const { expect } = require('chai');

const permissions = require('../lib');

describe('Feathers Authentication', () => {
  it('exposes middleware', () => {
    expect(typeof permissions.checkPermissions).to.equal('function');
    expect(typeof permissions.isPermitted).to.equal('function');
  });
});
