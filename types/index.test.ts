import feathers from '@feathersjs/feathers';
import checkPermissions from 'feathers-permissions';

const app = feathers();

app.use('/dummy', {
  async get(id: string) {
    return { id };
  }
});

app.service('dummy').hooks({
  before: checkPermissions({
    roles: [ 'admin' ]
  })
});

app.service('dummy').hooks({
  before: checkPermissions({
    roles: async () => [ 'admin' ]
  })
});
