# feathers-permissions

[![Build Status](https://travis-ci.org/feathersjs/feathers-permissions.png?branch=master)](https://travis-ci.org/feathersjs/feathers-permissions)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions/coverage)
[![Issue Count](https://codeclimate.com/github/feathersjs/feathers-permissions/badges/issue_count.svg)](https://codeclimate.com/github/feathersjs/feathers-permissions)

> Flexible and powerful permissions module for Feathers

## Installation

```
npm install feathers-permissions --save
```

## Documentation

Please refer to the [feathers-permissions documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-permissions`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-permissions');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
