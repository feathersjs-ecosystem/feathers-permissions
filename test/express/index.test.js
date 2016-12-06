import { expect } from 'chai';
import express from '../../src/express';

describe('express', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/express')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof express).to.equal('object');
  });

  it('exposes checkPermissions', () => {
    expect(typeof express.checkPermissions).to.equal('function');
  });

  it('exposes isPermitted', () => {
    expect(typeof express.isPermitted).to.equal('function');
  });
});
