'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setPermissions;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers-permissions:hooks:check-permissions');

// Permissions take the form of
// * - all services, all methods, all docs
// users:* - all methods on users service
// users:remove:* - can remove any user
// *:remove - can remove on any service
// users:remove:1234 - can only remove user with id 1234
// users:*:1234 - can call any service method for user with id 1234

/*
 * A hook to programmatically set permissions on a resource
 */

function setPermissions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function (hook) {
    if (hook.type !== 'before') {
      return Promise.reject(new Error('The \'setPermissions\' hook should only be used as a \'before\' hook.'));
    }

    // If it is an internal call then skip this hook
    if (!hook.params.provider) {
      return Promise.resolve(hook);
    }

    options = Object.assign({}, options);

    debug('Running setPermissions hook with options:', options);

    if (!options.namespace) {
      return Promise.reject(new Error('\'namespace\' must be provided to the setPermissions() hook.'));
    }

    if (!options.on) {
      return Promise.reject(new Error('\'on\' must be provided to the setPermissions() hook.'));
    }

    if (!options.field) {
      return Promise.reject(new Error('\'field\' must be provided to the setPermissions() hook.'));
    }

    var entity = hook.params[options.on];

    if (!entity) {
      debug('hook.params.' + options.on + ' does not exist. If you were expecting it to be defined check your hook order and your idField options in your auth config.');
      return Promise.resolve(hook);
    }

    var id = hook.id;
    var method = hook.method;
    var permissions = entity[options.field] || [];

    // Normalize permissions. They can either be a
    // comma separated string or an array.
    // TODO (EK): May need to support joins on SQL tables
    if (typeof permissions === 'string') {
      permissions = permissions.split(',');
    }

    if (!permissions.length) {
      debug('\'' + options.field + ' is missing from \'' + options.on + '\' or is empty.');
      return Promise.resolve(hook);
    }

    var requiredPermissions = ['*', '' + options.namespace, options.namespace + ':*', '*:' + method, options.namespace + ':' + method];

    if (!!id || id === 0) {
      requiredPermissions = requiredPermissions.concat([options.namespace + ':*:' + id, options.namespace + ':' + method + ':' + id]);
    }

    debug('Required Permissions', requiredPermissions);

    hook.params.permitted = permissions.some(function (permission) {
      return requiredPermissions.includes(permission);
    });

    return Promise.resolve(hook);
  };
}
module.exports = exports['default'];