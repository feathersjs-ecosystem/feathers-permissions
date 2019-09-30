const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const checkPermissions = require('../lib');

describe('feathers-permissions integration tests', () => {
  let app;
  describe('with predefined roles', () => {
    beforeEach(() => {
      app = feathers();

      app.use('/messages', memory());

      app.service('messages').hooks({
        before: checkPermissions({
          roles: ['messages', 'admin']
        })
      });
    });

    describe('internal calls', () => {
      it('does nothing when no entity is available', () => {
        return app.service('messages').create({ text: 'hello' }).then(result => {
          assert.deepStrictEqual(result, {
            id: 0,
            text: 'hello'
          });
        });
      });

      it('sets isPermitted false when entity is available but has no permissions', () => {
        const user = {
          email: 'someuser@example.com',
          permissions: []
        };
        app.service('messages').hooks({
          before (context) {
            context.data.permitted = context.params.permitted;
          }
        });

        return app.service('messages').create({ text: 'hello' }, { user })
          .then(result => {
            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello',
              permitted: false
            });
          });
      });

      it('sets isPermitted true when entity is available and has correct permissions', () => {
        const user = {
          email: 'someuser@example.com',
          permissions: ['admin:create']
        };
        app.service('messages').hooks({
          before (context) {
            context.data.permitted = context.params.permitted;
          }
        });

        return app.service('messages').create({ text: 'hello' }, { user })
          .then(result => {
            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello',
              permitted: true
            });
          });
      });
    });

    describe('external calls', () => {
      it('throws an error when no entity is available', () => {
        const params = { provider: 'test' };

        return app.service('messages').create({ text: 'hello' }, params)
          .then(() => assert.fail('Should never get here'))
          .catch(error => assert.deepStrictEqual(error.toJSON(), {
            name: 'Forbidden',
            message: 'You do not have the correct permissions (invalid permission entity).',
            code: 403,
            className: 'forbidden',
            data: undefined,
            errors: {}
          }));
      });

      it('throws an error when entity is available but has no permissions', () => {
        const params = {
          provider: 'test',
          user: {
            email: 'someuser@example.com'
          }
        };

        return app.service('messages').create({ text: 'hello' }, params)
          .then(() => assert.fail('Should never get here'))
          .catch(error => assert.deepStrictEqual(error.toJSON(), {
            name: 'Forbidden',
            message: 'You do not have the correct permissions.',
            code: 403,
            className: 'forbidden',
            data: undefined,
            errors: {}
          }));
      });

      describe('successful permission', () => {
        ['*', 'admin:*', '*:create', 'admin:create'].forEach(permission => {
          it(`allows the '${permission}' permission as array`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(result => assert.deepStrictEqual(result, {
                id: 0,
                text: 'hello'
              }));
          });

          it(`allows the '${permission}' permission as string`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: `something:create , ${permission}`
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(result => assert.deepStrictEqual(result, {
                id: 0,
                text: 'hello'
              }));
          });
        });
      });

      describe('unsuccessful permission', () => {
        ['user:*', '*:update', 'admin:find'].forEach(permission => {
          it(`fails the '${permission}' permission`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(() => assert.fail('Should never get here'))
              .catch(error => assert.deepStrictEqual(error.toJSON(), {
                name: 'Forbidden',
                message: 'You do not have the correct permissions.',
                code: 403,
                className: 'forbidden',
                data: undefined,
                errors: {}
              }));
          });
        });
      });
    });
  });

  describe('with `roles` as function', () => {
    beforeEach(() => {
      app = feathers();
      app.hooks({
        before: checkPermissions({
          roles (context) {
            return Promise.resolve(['admin', context.path]);
          }
        })
      });
      app.use('/messages', memory());
    });

    describe('internal calls', () => {
      it('does nothing when no entity is available', () => {
        return app.service('messages').create({ text: 'hello' }).then(result => {
          assert.deepStrictEqual(result, {
            id: 0,
            text: 'hello'
          });
        });
      });

      it('sets isPermitted false when entity is available but has no permissions', () => {
        const user = {
          email: 'someuser@example.com',
          permissions: []
        };
        app.service('messages').hooks({
          before (context) {
            context.data.permitted = context.params.permitted;
          }
        });

        return app.service('messages').create({ text: 'hello' }, { user })
          .then(result => {
            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello',
              permitted: false
            });
          });
      });

      it('sets isPermitted false when entity is available but has no permissions', () => {
        const user = {
          email: 'someuser@example.com',
          permissions: ['messages:create']
        };
        app.service('messages').hooks({
          before (context) {
            context.data.permitted = context.params.permitted;
          }
        });

        return app.service('messages').create({ text: 'hello' }, { user })
          .then(result => {
            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello',
              permitted: true
            });
          });
      });
    });

    describe('external calls', () => {
      it('throws an error when no entity is available', () => {
        const params = { provider: 'test' };

        return app.service('messages').create({ text: 'hello' }, params)
          .then(() => assert.fail('Should never get here'))
          .catch(error => assert.deepStrictEqual(error.toJSON(), {
            name: 'Forbidden',
            message: 'You do not have the correct permissions (invalid permission entity).',
            code: 403,
            className: 'forbidden',
            data: undefined,
            errors: {}
          }));
      });

      it('throws an error when entity is available but has no permissions', () => {
        const params = {
          provider: 'test',
          user: {
            email: 'someuser@example.com'
          }
        };

        return app.service('messages').create({ text: 'hello' }, params)
          .then(() => assert.fail('Should never get here'))
          .catch(error => assert.deepStrictEqual(error.toJSON(), {
            name: 'Forbidden',
            message: 'You do not have the correct permissions.',
            code: 403,
            className: 'forbidden',
            data: undefined,
            errors: {}
          }));
      });

      describe('successful permission', () => {
        ['*', 'messages:*', '*:create', 'messages:create'].forEach(permission => {
          it(`allows the '${permission}' permission as array`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(result => assert.deepStrictEqual(result, {
                id: 0,
                text: 'hello'
              }));
          });

          it(`allows the '${permission}' permission as string`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: `something:create , ${permission}`
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(result => assert.deepStrictEqual(result, {
                id: 0,
                text: 'hello'
              }));
          });
        });
      });

      describe('unsuccessful permission', () => {
        ['user:*', '*:update', 'messages:find'].forEach(permission => {
          it(`fails the '${permission}' permission`, () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            return app.service('messages').create({ text: 'hello' }, params)
              .then(() => assert.fail('Should never get here'))
              .catch(error => assert.deepStrictEqual(error.toJSON(), {
                name: 'Forbidden',
                message: 'You do not have the correct permissions.',
                code: 403,
                className: 'forbidden',
                data: undefined,
                errors: {}
              }));
          });
        });
      });
    });
  });
});
