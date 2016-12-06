if(!global._babelPolyfill) { require('babel-polyfill'); }

/*jshint expr: true*/

import permissions, { express, hooks, filters } from '../src';
import { expect } from 'chai';

describe('Feathers Permissions', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof permissions).to.equal('object');
  });

  it('exposes hooks', () => {
    expect(typeof hooks).to.equal('object');
  });

  it('exposes express middleware', () => {
    expect(typeof express).to.equal('object');
  });

  it('exposes filters', () => {
    expect(typeof filters).to.equal('object');
  });
});
