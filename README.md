# feathers-permissions

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs-ecosystem/feathers-permissions.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs-ecosystem/feathers-permissions.png?branch=master)](https://travis-ci.org/feathersjs-ecosystem/feathers-permissions)
[![Dependency Status](https://img.shields.io/david/feathersjs-ecosystem/feathers-permissions.svg?style=flat-square)](https://david-dm.org/feathersjs-ecosystem/feathers-permissions)
[![Download Status](https://img.shields.io/npm/dm/feathers-permissions.svg?style=flat-square)](https://www.npmjs.com/package/feathers-permissions)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Flexible permissions module for Feathers

## Installation

```
npm install feathers-permissions --save
```

## Example

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const checkPermissions = require('feathers-permissions');
const app = feathers();

app.use('/messages', memory());

app.service('messages').hooks({
  before: checkPermissions({
    roles: [ 'admin', 'user' ]
  })
});

// User from the database (e.g. added via @feathersjs/authentication)
const user = {
  email: 'someuser@example.com',
  permissions: [ 'user:find', 'user:get' ]
  // Also possible
  permissions: 'user:find,user:get'
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
```

## Documentation

Feathers permissions allows you to grant and manage permissions in a flexible nature. Each object that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database).

### Options

The following options are available:

- `roles` - A list of roles to check
- `entity` (default: `user`) - The name of the entity (`params[entity]`)
- `field` (default: `permissions`) - The name of the permissions field.
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
