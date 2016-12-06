# feathers-permissions

[![Build Status](https://travis-ci.org/feathersjs/feathers-permissions.png?branch=master)](https://travis-ci.org/feathersjs/feathers-permissions)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-permissions.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-permissions)
[![Download Status](https://img.shields.io/npm/dm/feathers-permissions.svg?style=flat-square)](https://www.npmjs.com/package/feathers-permissions)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Flexible and powerful permissions module for Feathers

## Installation

```
npm install feathers-permissions --save
```

## Documentation

<!-- Please refer to the [feathers-permissions documentation](http://docs.feathersjs.com/) for more details. -->

Feathers permissions allows you to grant and manage permissions in a flexible nature. Each entity, in most cases a user, that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database). It typically goes hand in hand with [feathers-authentication](https://github.com/feathersjs/feathers-authentication) but can be used separately.

## API

This module contains:

1. [Hooks](#hooks)
2. [Express middleware](#express-middleware)
3. [Feathers event filters](#filters)

### Hooks

#### checkPermissions

This hook is used as a before hook to check that an entity (by default a `user`) has valid permissions to perform a certain service call on a given resource. You can chain multiple `checkPermissions` hooks to create complex permissions logic. **It is non-erroring hook that simply sets `hook.params.__isPermitted` to `true` or leaves it alone.**

##### Default Options

```js
{
  entity: 'user', // the entity attached to hook.params that will be checked for permissions
  field: 'permissions' // the field name the permissions are stored on the entity
}
```

#### isPermitted

This hook enforces the permissions rules applied by `checkPermissions` by simply checking if `hook.params.__isPermitted` is `true`. If it isn't it rejects with a `Forbidden` error.

Here is an example of both hooks being used together:

```js
app.service('users').hooks({
  before: {
    remove: [
      // a user with remove permissions on the 'users' service can remove
      permissions.hooks.checkPermissions({ service: 'users' }),
      // or a user in the support group can remove
      permissions.hooks.checkPermissions({ group: 'support' }),
      // or a user with either an admin or superadmin role can remove
      permissions.hooks.checkPermissions({ roles: ['admin', 'superadmin'] }),
      // check to see if hook.params.__isPermitted is true otherwise reject
      permissions.hooks.isPermitted()
    ]
  }
});
```

#### setPermissions

This hook is used as a before or after hook to set permissions on an entity. When used as an after hook it will make an additional database call to update the entity in question.

```js
app.service('users').hooks({
  after: {
    create: [
      // a user can get their own record and update their own record
      permissions.hooks.setPermissions({
        permissions: [
          'users:get:id',
          'users:update:id',
          'users:patch:id'
        ]
      })
    ]
  }
});
```

##### Default Options

```js
{
  field: 'permissions', // the field name the permissions are stored on the entity
  self: true, // whether it should process permissions and inject the entity id into the requested permission (ie. 'users:remove:id' would become 'users:remove:1234')
  asArray: true // whether permissions should be set as an array. If false they are set as a comma separated string, which is required for many SQL DBs.
}
```

### Express Middleware

#### checkPermissions

Much the same as the hook, this express middleware is used to check permissions. The difference is you need to explicitly pass the permissions list you want to verify against.

##### Default Options

```js
{
  entity: 'user', // the entity attached to the req object that will be checked for permissions
  field: 'permissions' // the field name the permissions are stored on the entity
}
```

#### isPermitted

This middleware enforces the permissions rules applied by `checkPermissions` by simply checking if `req.__isPermitted` is `true`. If it isn't it calls `next` with a `Forbidden` error.

Here is an example of both middleware being used together:

```js
const options = {
    permissions: ['admin', 'superadmin'],
    on: 'user',
    field: 'role'
};

app.get(
  '/protected',
  permissions.express.checkPermissions(options),
  permissions.express.isPermitted(),
  function(req, res, next) {
    // do permitted things    
  }
);
```


### Filters

#### checkPermissions

Pretty much exactly the same as the hook, this event filter is used to check that the authenticated entity has the correct permissions to receive events for a given method on a given service.

##### Default Options

```js
{
  entity: 'user', // the entity attached to the socket that will be checked for permissions
  field: 'permissions' // the field name the permissions are stored on the entity
}
```

#### isPermitted

This filter enforces the permissions rules applied by the `checkPermissions` filter by simply checking if `data.__isPermitted` is `true`. If it isn't it returns `false` and the event will not be dispatched for the connected socket.

Here is an example of both filters being used together:

```js
app.service('users').filters({
  remove: [
    // a user with remove permissions can receive the event
    permissions.filters.checkPermissions({ service: 'users' }),
    // or a user in the support group can receive the event
    permissions.filters.checkPermissions({ group: 'support' }),
    // or a user with either an admin or superadmin role can receive the event
    permissions.filters.checkPermissions({ roles: ['admin', 'superadmin'] }),
    // check to see if hook.params.__isPermitted is true otherwise reject
    permissions.filters.isPermitted()
  ]
});
```

## Usage With Feathers + Feathers Authentication

Here's an example of a Feathers server that uses `feathers-authentication` and `feathers-permissions`. You can try it out on your own machine by running the [example](./example/).

```js
// app
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const permissions = require('feathers-permissions');
const memory = require('feathers-memory');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use(errorHandler());

app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local'])
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
});

app.service('users').hooks({
  before: {
    get: [
      auth.hooks.authenticate('jwt'),
      permissions.hooks.checkPermissions({ service: 'users' }),
      permissions.hooks.isPermitted()
    ],
    find: [
      auth.hooks.authenticate('jwt'),
      permissions.hooks.checkPermissions({ service: 'users' }),
      permissions.hooks.isPermitted()
    ],
    create: [
      local.hooks.hashPassword({ passwordField: 'password' })
    ],
    update: [
      auth.hooks.authenticate('jwt'),
      permissions.hooks.checkPermissions({ service: 'users' }),
      permissions.hooks.isPermitted()
    ],
    remove: [
      auth.hooks.authenticate('jwt'),
      permissions.hooks.checkPermissions({ service: 'users' }),
      permissions.hooks.isPermitted()
    ]
  },
  after: {
    create: [
      // update the user with the appropriate permissions
      permissions.hooks.setPermissions({ permissions: ['users:*:id']})
    ]
  }
});

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
