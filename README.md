# feathers-permissions

[![Build Status](https://travis-ci.org/feathersjs/feathers-permissions.png?branch=master)](https://travis-ci.org/feathersjs/feathers-permissions)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-permissions.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-permissions)
[![Download Status](https://img.shields.io/npm/dm/feathers-permissions.svg?style=flat-square)](https://www.npmjs.com/package/feathers-permissions)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Flexible and powerful permissions module for Feathers

**This module is not published yet. It's awaiting one more breaking change and then will go out by Nov. 21st. If you are feeling adventurous you can use by referencing `feathersjs/feathers-permission` in your `package.json`.**

## Installation

```
npm install feathers-permissions --save
```

## Documentation

<!-- Please refer to the [feathers-permissions documentation](http://docs.feathersjs.com/) for more details. -->

Feathers permissions allows you to grant and manage permissions in a flexible nature. Each object that requires permissions must have an array or a comma separated string of permissions stored on it (typically in your database). It typically goes hand in hand with [feathers-authentication]().

### Array Example

## Complete Example

Here's an example of a Feathers server that uses `feathers-permissions`.


```js
// app
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const hooks = require('feathers-permissions').hooks;
const middleware = require('feathers-permissions').middleware;
const memory = require('feathers-memory');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/users', memory())
  .use(errorHandler());

app.service('users').before({

});

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```


## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
