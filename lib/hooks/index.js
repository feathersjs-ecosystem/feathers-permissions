'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isPermitted = require('./is-permitted');

var _isPermitted2 = _interopRequireDefault(_isPermitted);

var _checkPermissions = require('./check-permissions');

var _checkPermissions2 = _interopRequireDefault(_checkPermissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  isPermitted: _isPermitted2.default,
  checkPermissions: _checkPermissions2.default
};
module.exports = exports['default'];