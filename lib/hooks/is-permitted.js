'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isPermitted;

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Debug from 'debug';
// const debug = Debug('feathers-permissions:hooks:is-permitted');

function isPermitted() {
  return function (hook) {
    if (hook.type !== 'before') {
      return Promise.reject(new Error('The \'isPermitted\' hook should only be used as a \'before\' hook.'));
    }

    if (hook.params.provider && !hook.params.permitted) {
      return Promise.reject(new _feathersErrors2.default.Forbidden('You do not have the correct permissions.'));
    }

    return Promise.resolve(hook);
  };
}
module.exports = exports['default'];