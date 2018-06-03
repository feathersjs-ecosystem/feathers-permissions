const { Forbidden } = require('@feathersjs/errors');
const debug = require('debug')('feathers-permissions');

module.exports = function checkPermissions (options = {}) {
  options = Object.assign({
    entity: 'user',
    field: 'permissions'
  }, options);

  const { entity: entityName, field, roles } = options;

  if (!Array.isArray(roles) && typeof roles !== 'function') {
    throw new Error(`'roles' option for feathers-permissions hook must be an array or a function`);
  }

  return function (context) {
    let currentRoles = roles;
    if (typeof roles === 'function') {
      currentRoles = roles(context);
    }

    if (context.type !== 'before') {
      return Promise.reject(new Error(`The feathers-permissions hook should only be used as a 'before' hook.`));
    }

    debug('Running checkPermissions hook with options:', options);

    const entity = context.params[entityName];

    if (!entity) {
      debug(`hook.params.${entityName} does not exist. If you were expecting it to be defined check your hook order and your idField options in your auth config.`);
      return context.params.provider
        ? Promise.reject(new Forbidden('You do not have the correct permissions (invalid permission entity).'))
        : Promise.resolve(context);
    }

    const method = context.method;
    let permissions = entity[field] || [];

    // Normalize permissions. They can either be a
    // comma separated string or an array.
    if (typeof permissions === 'string') {
      permissions = permissions.split(',').map(current => current.trim());
    }

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

    debug(`Required Permissions`, requiredPermissions);

    const permitted = permissions.some(permission => requiredPermissions.includes(permission));

    context.params.permitted = context.params.permitted || permitted;

    if (context.params.provider && options.error !== false && !context.params.permitted) {
      return Promise.reject(new Forbidden('You do not have the correct permissions.'));
    }

    return Promise.resolve(context);
  };
};
