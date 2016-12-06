/* jshint expr: true */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import errors from 'feathers-errors';
import { isPermitted } from '../../src/express';

chai.use(sinonChai);

describe('express:isPermitted', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      feathers: {}
    };
    res = {};
    next = sinon.spy();
  });

  afterEach(() => {
    next.reset();
  });

  describe('when not permitted', () => {
    it('calls next with a new error', () => {
      isPermitted()(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWith(new errors.Forbidden('You do not have the correct permissions.'));
    });
  });

  describe('when req.permitted', () => {
    beforeEach(() => { req.__isPermitted = true; });

    it('calls next', () => {
      isPermitted()(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWithExactly();
    });
  });

  describe('when req.feathers.permitted', () => {
    beforeEach(() => { req.__isPermitted = true; });

    it('calls next', () => {
      isPermitted()(req, res, next);
      expect(next).to.have.been.calledOnce;
      expect(next).to.have.been.calledWithExactly();
    });
  });
});
