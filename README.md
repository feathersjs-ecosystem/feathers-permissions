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

> __Important:__ The `feathers-permissions` hook should be used after the `authenticate()` hook by [@feathersjs/authentication](https://docs.feathersjs.com/api/authentication/server.html#authhooksauthenticatestrategies).

## Example

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

## Documentation

Feathers permissions allows you to grant and manage permissions in a flexible nature. Each object that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database).

### Options

The following options are available:

- `roles` - A list of roles to check
- `entity` (default: `user`) - The name of the entity (`params[entity]`)
- `field` (default: `permissions`) - The name of the permissions field. Can be a comma separated string of permissions or an array or permissions.
- `error` - If set to `false` will not throw a `Forbidden` error but instead set `params.permitted` to `true` or `false`. Useful for chaining permission hooks.

### Permission format

The list of permissions will be obtained from `params[entity][field]`. It can be a comma separate list or an array of permissions in the following format:

- `*` - Allow everything
- `${role}:*` - Allo every service method (`find`, `get`, `create`, `update`, `patch`, `remove`) for `role`
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

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
