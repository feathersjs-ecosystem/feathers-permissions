'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isPermitted;

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers-permissions:middleware:is-permitted');

function isPermitted(req, res, next) {
  debug('Checking for permitted request');

  if (req.permitted || req.feathers.permitted) {
    return next();
  }

  next(new _feathersErrors2.default.Forbidden('You do not have the correct permissions.'));
}
module.exports = exports['default'];