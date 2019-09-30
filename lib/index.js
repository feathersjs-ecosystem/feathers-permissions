const { Forbidden } = require('@feathersjs/errors');
const get = require('lodash/get');

const debug = require('debug')('feathers-permissions');

module.exports = function checkPermissions ({
  entity: entityName = 'user',
  field = 'permissions',
  error = true,
  roles
} = {}) {
  if (!Array.isArray(roles) && typeof roles !== 'function') {
    throw new Error('\'roles\' option for feathers-permissions hook must be an array or a function');
  }

  return async context => {
    const { params, type, method } = context;
    const currentRoles = await Promise.resolve(typeof roles === 'function' ? roles(context) : roles);

    if (type !== 'before') {
      throw new Error('The feathers-permissions hook should only be used as a \'before\' hook.');
    }

    debug('Running checkPermissions hook with options:', { entityName, field, roles });

    const entity = context.params[entityName];

    if (!entity) {
      debug(`hook.params.${entityName} does not exist. If you were expecting it to be defined check your hook order and your idField options in your auth config.`);

      if (params.provider) {
        throw new Forbidden('You do not have the correct permissions (invalid permission entity).');
      }

      return context;
    }

    // Normalize permissions. They can either be a comma separated string or an array.
    const value = get(entity, field, []);
    const permissions = typeof value === 'string'
      ? value.split(',').map(current => current.trim()) : value;
    const requiredPermissions = [
      '*',
      `*:${method}`
    ];

    currentRoles.forEach(role => {
      requiredPermissions.push(
        `${role}`,
        `${role}:*`,
        `${role}:${method}`
      );
    });

    debug('Required Permissions', requiredPermissions);

    const permitted = permissions.some(permission => requiredPermissions.includes(permission));

    context.params = {
      permitted,
      ...params
    };

    if (context.params.provider && error !== false && !context.params.permitted) {
      throw new Forbidden('You do not have the correct permissions.');
    }

    return context;
  };
};
