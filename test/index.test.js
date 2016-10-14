import { expect } from 'chai';
import plugin from '../src';

describe('feathers-permissions', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof plugin).to.equal('function', 'It worked');
  });

  it('exposes the Service class', () => {
    expect(plugin.Service).to.not.equal(undefined);
  });
});
