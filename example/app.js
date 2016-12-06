const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errors = require('feathers-errors');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const permissions = require('../lib/index');

const app = feathers();
app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', feathers.static(__dirname + '/public'));

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

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
  before: {
    find: [
      auth.hooks.authenticate('jwt')
    ],
    get: [
      auth.hooks.authenticate('jwt'),
      permissions.hooks.checkPermissions({ service: 'users' }),
      permissions.hooks.isPermitted()
    ],
    create: [
      local.hooks.hashPassword({ passwordField: 'password' })
    ]
  },
  after: {
    create: [
      permissions.hooks.setPermissions({ permissions: ['users:*:id'] })
    ]
  }
});

// Only emit events to permitted users
app.service('users').filter({
  all: [
    permissions.filters.checkPermissions({ service: 'users' }),
    permissions.filters.isPermitted()
  ]
});

// Custom Express routes
app.get('/protected',
  auth.express.authenticate('jwt'),
  permissions.express.checkPermissions({ permissions: ['*'] }),
  permissions.express.isPermitted(),
  (req, res, next) => {
    res.json({ success: true });
  }
);

app.get('/unprotected', (req, res, next) => {
  res.json({ success: true });
});

var User = {
  email: 'admin@feathersjs.com',
  password: 'admin'
};

app.service('users').create(User).then(user => {
  console.log('Created default user', user);
}).catch(console.error);

app.use(errorHandler());

app.listen(3030);

console.log('Feathers authentication with local auth started on 127.0.0.1:3030');
