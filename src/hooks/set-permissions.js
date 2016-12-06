/*
 * A hook to programmatically set permissions on a resource
 */

import { checkContext, getItems, replaceItems } from 'feathers-hooks-common/lib/utils';
import Debug from 'debug';

const debug = Debug('feathers-permissions:hooks:set-permissions');
const defaults = {
  field: 'permissions',
  self: true,
  asArray: true
};

const populatePermissions = function (item, options, id) {
  // Handle permissions like users:remove:id and
  // replace id with the actual resource id.
  let permissions = options.permissions;

  if (options.self) {
    permissions = permissions.map(permission => {
      if (id !== undefined && permission.includes(':id')) {
        permission = permission.replace(':id', `:${id}`);
      }

      return permission;
    });
  }

  item[options.field] = options.asArray ? permissions : permissions.join(',');

  debug(`Setting permissions on field '${options.field}'`, item[options.field]);

  return item;
};

export default function setPermissions (options = {}) {
  options = Object.assign({}, defaults, options);

  if (!Array.isArray(options.permissions)) {
    return Promise.reject(new Error(`options.permissions must be an array of string permissions provided to setPermissions`));
  }

  return function (hook) {
    try {
      checkContext(hook, null, ['create', 'patch', 'update'], 'setPermissions');
    } catch (error) {
      return Promise.reject(error);
    }

    const service = this;
    let items = getItems(hook);
    items = Array.isArray(items) ? items.map(item => populatePermissions(item, options, hook.id || item[service.id])) : populatePermissions(items, options, hook.id || items[service.id]);
    replaceItems(hook, items);

    if (hook.type === 'before') {
      return Promise.resolve(hook);
    }

    if (hook.type === 'after') {
      // Update entity with new permissions in the DB
      items = Array.isArray(items) ? items : [items];
      const promises = items.map(item => service.update(hook.id || item[service.id], item));

      // TODO (EK): Handle if an update fails in the middle of updating
      // a bunch of records. Do we roll back? We likely should be using better
      // async flow control here.
      return Promise.all(promises).then(() => Promise.resolve(hook));
    }
  };
}
