import Debug from 'debug';

const debug = Debug('feathers-permissions:hooks:check-permissions');

// Permissions take the form of
// * - all services, all methods, all docs
// users:* - all methods on users service
// users:remove:* - can remove any user
// *:remove - can remove on any service
// users:remove:1234 - can only remove user with id 1234
// users:*:1234 - can call any service method for user with id 1234

export default function checkPermissions (options = {}) {
  // TODO (EK): Support `options.service` and `options.group` and normalize
  // them to options.namespace internally here
  return function (hook) {
    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'checkPermissions' hook should only be used as a 'before' hook.`));
    }

    // If it is an internal call then skip this hook
    if (!hook.params.provider) {
      return Promise.resolve(hook);
    }

    options = Object.assign({ on: 'user', field: 'permissions' }, options);

    let namespaces;

    if (options.service) {
      namespaces = [options.service];
    } else if (options.group) {
      namespaces = [options.group];
    } else if (options.roles) {
      namespaces = options.roles;
    }

    debug('Running checkPermissions hook with options:', options);

    if (!namespaces) {
      return Promise.reject(new Error(`'service' or 'group' must be provided to the checkPermissions() hook.`));
    }

    if (!options.on) {
      return Promise.reject(new Error(`'on' must be provided to the checkPermissions() hook.`));
    }

    if (!options.field) {
      return Promise.reject(new Error(`'field' must be provided to the checkPermissions() hook.`));
    }

    const entity = hook.params[options.on];

    if (!entity) {
      debug(`hook.params.${options.on} does not exist. If you were expecting it to be defined check your hook order and your idField options in your auth config.`);
      return Promise.resolve(hook);
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
      return Promise.resolve(hook);
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
        perms = perms.concat([
          `${namespace}:*:${id}`,
          `${namespace}:${method}:${id}`
        ]);
      }

      requiredPermissions = requiredPermissions.concat(perms);
    });

    debug(`Required Permissions`, requiredPermissions);

    hook.params.permitted = permissions.some(permission => requiredPermissions.includes(permission));

    return Promise.resolve(hook);
  };
}
