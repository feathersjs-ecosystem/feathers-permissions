/*jshint expr: true*/

import permissions, { middleware, hooks } from '../src';
import { expect } from 'chai';

describe('Feathers Authentication', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof permissions).to.equal('object');
  });

  it('exposes hooks', () => {
    expect(typeof hooks).to.equal('object');
  });

  it('exposes middleware', () => {
    expect(typeof middleware).to.equal('object');
  });
});
