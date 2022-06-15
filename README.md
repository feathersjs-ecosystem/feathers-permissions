# feathers-permissions

[![CI](https://github.com/feathersjs-ecosystem/feathers-permissions/workflows/CI/badge.svg)](https://github.com/feathersjs-ecosystem/feathers-permissions/actions?query=workflow%3ACI)
[![Dependency Status](https://img.shields.io/david/feathersjs-ecosystem/feathers-permissions.svg?style=flat-square)](https://david-dm.org/feathersjs-ecosystem/feathers-permissions)
[![Download Status](https://img.shields.io/npm/dm/feathers-permissions.svg?style=flat-square)](https://www.npmjs.com/package/feathers-permissions)

> Simple role and service method permissions for Feathers

> __Note:__ This module implements a hook simple role and service method based permissions checked against the permissions in a user (entity) object. More complex requirements can already be implemented as [custom Feathers hooks](https://docs.feathersjs.com/api/hooks.html). See [here](https://blog.feathersjs.com/access-control-strategies-with-feathersjs-72452268739d) and [here](https://blog.feathersjs.com/authorization-with-casl-in-feathersjs-app-fd6e24eefbff) for more information.

## Installation

```
npm install feathers-permissions --save
```

> __Important:__ The `feathers-permissions` hook should be used after the `authenticate()` [hook from @feathersjs/authentication](https://docs.feathersjs.com/api/authentication/hook.html).

## Simple example

The following example will limit all `messages` service calls to users that have `admin` in their `roles`:

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const checkPermissions = require('feathers-permissions');
const app = feathers();

app.use('/messages', memory());

app.service('messages').hooks({
  before: [
    authenticate('jwt'),
    checkPermissions({
      roles: [ 'admin' ]
    })
  ]
});

// User from the database
const user = {
  email: 'someuser@example.com',
  permissions: [ 'admin' ]
}
```

## Documentation

Feathers permissions allows you to grant and manage permissions in a flexible nature based on role and service method. Each object that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database).

### Options

The following options are available:

- `roles` - A list of permission roles to check or a function that takes the hook `context` and returns a list of roles. Can be a comma separated string of roles or an array of roles.
- `entity` (default: `user`) - The name of the entity (`params[entity]`)
- `field` (default: `permissions`) - The name of the permissions field on the entity. May be dot separated to access nested fields.
- `error` - If set to `false` will not throw a `Forbidden` error but instead set `params.permitted` to `true` or `false`. Useful for chaining permission hooks.

### Permission format

The list of permissions will be obtained from `params[entity]` and `field`. It can be a comma separate list or an array of permissions in the following format:

- `*` - Allow everything
- `${role}` or `${role}:*` - Allow every service method (`find`, `get`, `create`, `update`, `patch`, `remove`) for `role`
- `*:${method}` - Allow `method` service method for any role
- `${role}:${method}` - Allow `method` service method for `role`

This means the following use of `feathers-permissions`:

```js
app.service('messages').hooks({
  before: checkPermissions({
    roles: [ 'admin', 'user' ]
  })
});
```

Will allow user `permissions` containing `*`, `admin:*`, `user:*` and the service method that is being called (e.g. `admin:create` or `user:find` and `*:create` and `*:find`).

The following will create a dynamic permission based on the hook [`context.path`](https://docs.feathersjs.com/api/hooks.html#context-path):

```js
app.service('messages').hooks({
  before: checkPermissions({
    roles: context => {
      return [ 'admin', context.path ];
    }
  })
});
```

Permissions can also be assembled asynchronously:

```js
app.service('messages').hooks({
  before: checkPermissions({
    roles: async context => {
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

To conditionally either allow access by roles or otherwise restrict to the current user, a combination of `feathers-permissions` - setting the `error` option to `false` - [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks) and [feathers-hooks-common#iff](https://hooks-common.feathersjs.com/hooks.html#iff) (checking for `params.permitted`) can be used:

```js
app.service('messages').hooks({
  before: {
    find: [
      checkPermissions({
        roles: ['super_admin', 'admin'],
        field: 'roles',
        error: false
      }),
      iff(context => !context.params.permitted,
        setField({
          from: 'params.user._id',
          as: 'params.query.userId'
        })
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
    roles: [ 'admin', 'messages' ]
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
  user
});

// Will fail
app.service('messages').create({
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
