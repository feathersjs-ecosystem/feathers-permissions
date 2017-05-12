'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkPermissions;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers-permissions:middleware:check-permissions');

function checkPermissions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  debug('Registering checkPermissions middleware');

  return function (req, res, next) {
    debug('Running checkPermissions middleware with options:', options);

    next();
  };
}
module.exports = exports['default'];