/* jshint expr: true */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
// import errors from 'feathers-errors';
import { checkPermissions } from '../../src/express';

chai.use(sinonChai);

describe('express:checkPermissions', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = {};
    next = sinon.spy();
  });

  afterEach(() => {
    next.reset();
  });

  it('calls next', () => {
    checkPermissions()(req, res, next);
    expect(next).to.have.been.calledOnce;
  });
});
