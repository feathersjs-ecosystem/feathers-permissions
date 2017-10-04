'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _middleware = require('./middleware');

var middleware = _interopRequireWildcard(_middleware);

var _hooks = require('./hooks');

var hooks = _interopRequireWildcard(_hooks);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
  hooks: hooks,
  middleware: middleware
};
module.exports = exports['default'];