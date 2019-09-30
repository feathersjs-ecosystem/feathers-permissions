# feathers-permissions

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs-ecosystem/feathers-permissions.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs-ecosystem/feathers-permissions.png?branch=master)](https://travis-ci.org/feathersjs-ecosystem/feathers-permissions)
[![Dependency Status](https://img.shields.io/david/feathersjs-ecosystem/feathers-permissions.svg?style=flat-square)](https://david-dm.org/feathersjs-ecosystem/feathers-permissions)
[![Download Status](https://img.shields.io/npm/dm/feathers-permissions.svg?style=flat-square)](https://www.npmjs.com/package/feathers-permissions)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Simple role and service method permissions for Feathers

> __Note:__ This module implements a hook simple role and service method based permissions checked against the permissions in a user (entity) object. More complex requirements can already be implemented as [custom Feathers hooks](https://docs.feathersjs.com/api/hooks.html). See [here](https://blog.feathersjs.com/access-control-strategies-with-feathersjs-72452268739d) and [here](https://blog.feathersjs.com/authorization-with-casl-in-feathersjs-app-fd6e24eefbff) for more information.

## Installation

```
npm install feathers-permissions --save
```

> __Important:__ The `feathers-permissions` hook should be used after the `authenticate()` [hook from @feathersjs/authentication](https://docs.feathersjs.com/api/authentication/hook.html).

## Simple example

The following example will limit all `messages` service calls to users that have `admin` in their `permissions`:

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const checkPermissions = require('feathers-permissions');
const app = feathers();

app.use('/messages', memory());

app.service('messages').hooks({
  before: checkPermissions({
    permissions: [ 'admin' ]
  })
});

// User from the database
const user = {
  email: 'someuser@example.com',
  permissions: [ 'admin' ]
}
```

## Documentation

Feathers permissions allows you to grant and manage permissions in a flexible nature. Each object that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database).

### Options

The following options are available:

- `permissions` - A list of permissions to check or a function that takes the hook `context` and returns a list of permissions. Can be a comma separated string of permissions or an array of permissions.
- `entity` (default: `user`) - The name of the entity (`params[entity]`)
- `field` (default: `permissions`) - The name of the permissions field. May be dot separated to access nested fields.
- `error` - If set to `false` will not throw a `Forbidden` error but instead set `params.permitted` to `true` or `false`. Useful for chaining permission hooks.

### Permission format

The list of permissions will be obtained from `params[entity][field]`. It can be a comma separate list or an array of permissions in the following format:

- `*` - Allow everything
- `${permission}` or `${permission}:*` - Allow every service method (`find`, `get`, `create`, `update`, `patch`, `remove`) for `permission`
- `*:${method}` - Allow `method` service method for any permission
- `${permission}:${method}` - Allow `method` service method for `permission`

This means the following use of `feathers-permissions`:

```js
app.service('messages').hooks({
  before: checkPermissions({
    permissions: [ 'admin', 'user' ]
  })
});
```

Will allow user `permissions` containing `*`, `admin:*`, `user:*` and the service method that is being called (e.g. `admin:create` or `user:find` and `*:create` and `*:find`).

The following will create a dynamic permission based on the hook [`context.path`](https://docs.feathersjs.com/api/hooks.html#contextpath):

```js
app.service('messages').hooks({
  before: checkPermissions({
    permissions: context => {
      return [ 'admin', context.path ];
    }
  })
});
```

Permissions can also be assembled asynchronously:

```js
app.service('messages').hooks({
  before: checkPermissions({
    permissions: async context => {
      const { user } = context.params;
      const roles = await app.service('roles').find({
        query: {
          userId: user._id
        }
      });

      return roles.data;
    }
  })
});
```

### Conditionally restricting permissions

To conditionally either allow access by permission or otherwise restrict to the current user, a combination of `feathers-permissions` - setting the `error` option to `false` - [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks) and [feathers-hooks-common#iff](https://feathers-plus.github.io/v1/feathers-hooks-common/#iff) (checking for `params.permitted`) can be used:

```js
app.service('messages').hooks({
  before: {
    find: [
      checkPermissions({
        permissions: ['super_admin', 'admin'],
        field: 'roles',
        error: false
      }),
      iff(context => !context.params.permitted,
        restrictToOwner({ idField: '_id', ownerField: '_id'})
      )
    ]
  }
});
```

## More examples

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const checkPermissions = require('feathers-permissions');
const app = feathers();

app.use('/messages', memory());

app.service('messages').hooks({
  before: checkPermissions({
    permissions: [ 'admin', 'messages' ]
  })
});

// User from the database (e.g. added via @feathersjs/authentication)
const user = {
  email: 'someuser@example.com',
  permissions: [ 'messages:find', 'messages:get' ]
  // Also possible
  permissions: 'messages:find,messages:get'
}

const admin = {
  email: 'someuser@example.com',
  permissions: [ 'admin:*' ]
}

// Will pass
app.service('messages').find({
  provider: 'rest', // this will be set automatically by external calls
  user
});

// Will fail
app.service('messages').create({
  provider: 'rest', // this will be set automatically by external calls
  user
});

// Will pass
app.service('messages').create({
  provider: 'rest', // this will be set automatically by external calls
  user: admin
});
```

## License

Copyright (c) 2019

Licensed under the [MIT license](LICENSE).
