// import Debug from 'debug';
const Debug = require('debug');
const debug = Debug('feathers-permissions:filters:check-permissions');

module.exports = function (options = {}) {
  return function checkPermissions (data, connection, hook) {
    options = Object.assign({ on: 'user', field: 'permissions' }, options);

    let namespaces;

    if (options.service) {
      namespaces = [options.service];
    } else if (options.group) {
      namespaces = [options.group];
    } else if (options.roles) {
      namespaces = options.roles;
    }

    debug('Running checkPermissions filter with options:', options);

    if (!namespaces) {
      return Promise.reject(new Error(`'service' or 'group' must be provided to the checkPermissions() filter.`));
    }

    if (!options.on) {
      return Promise.reject(new Error(`'on' must be provided to the checkPermissions() filter.`));
    }

    if (!options.field) {
      return Promise.reject(new Error(`'field' must be provided to the checkPermissions() filter.`));
    }

    const entity = connection[options.on];

    if (!entity) {
      debug(`hook.params.${options.on} does not exist. Check that you are authenticated properly.`);
      return data;
    }

    const id = hook.id;
    const method = hook.method;
    let permissions = entity[options.field] || [];

    // Normalize permissions. They can either be a
    // comma separated string or an array.
    // NOTE (EK): May need to support joins on SQL tables to make
    // this more efficient in the future.
    if (typeof permissions === 'string') {
      permissions = permissions.split(',');
    }

    if (!permissions.length) {
      debug(`'${options.field} is missing from '${options.on}' or is empty.`);
      return data;
    }

    let requiredPermissions = [
      '*',
      `*:${method}`,
      `*:${method}:*`
    ];

    namespaces.forEach(namespace => {
      let perms = [
        `${namespace}`,
        `${namespace}:*`,
        `${namespace}:*:*`,
        `${namespace}:${method}`,
        `${namespace}:${method}:*`
      ];

      // If we are requesting a resource with an ID add those
      // as permissions checks.
      if (!!id || id === 0) {
        perms = permissions.concat([
          `${namespace}:*:${id}`,
          `${namespace}:${method}:${id}`
        ]);
      }

      requiredPermissions = requiredPermissions.concat(perms);
    });

    debug(`Required Permissions`, requiredPermissions);
    const permitted = permissions.some(permission => requiredPermissions.includes(permission));

    Object.defineProperty(data, '__isPermitted', { value: permitted });

    return data;
  };
};
