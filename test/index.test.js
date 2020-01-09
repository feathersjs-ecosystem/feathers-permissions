const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const checkPermissions = require('../lib');

describe('feathers-permissions integration tests', () => {
  let app;

  it('errors when no roles are passed', () => {
    assert.throws(() => checkPermissions(), {
      message: '\'roles\' option for feathers-permissions hook must be an array or a function'
    });
  });

  it('errors when used as an after hook', async () => {
    await assert.rejects(() => checkPermissions({
      roles: ['something']
    })({ type: 'after' }), {
      message: 'The feathers-permissions hook should only be used as a \'before\' hook.'
    });
  });

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
      it('does nothing when no entity is available', async () => {
        const result = await app.service('messages').create({ text: 'hello' });

        assert.deepStrictEqual(result, {
          id: 0,
          text: 'hello'
        });
      });

      it('sets permitted true when entity is available and has correct permissions', async () => {
        const user = {
          email: 'someuser@example.com',
          permissions: ['admin:create']
        };

        app.service('messages').hooks({
          before (context) {
            context.data.permitted = context.params.permitted;
          }
        });

        const result = await app.service('messages').create({ text: 'hello' }, { user });

        assert.deepStrictEqual(result, {
          id: 0,
          text: 'hello',
          permitted: true
        });
      });

      it('sets permitted false when error = false and does not have correct permissions', async () => {
        const user = {
          email: 'someuser@example.com',
          permissions: ['admin:create']
        };

        app.use('/dummy', {
          async create (data, { permitted }) {
            return {
              ...data,
              permitted
            };
          }
        });

        app.service('dummy').hooks({
          before: checkPermissions({
            roles: ['dummy-permission'],
            error: false
          })
        });

        const result = await app.service('dummy').create({ text: 'hello' }, { user });

        assert.deepStrictEqual(result, {
          text: 'hello',
          permitted: false
        });
      });

      it('always throws error when entity is available but does not have permissions', async () => {
        const user = {
          email: 'someuser@example.com',
          permissions: []
        };

        await assert.rejects(() => app.service('messages').create({ text: 'hello' }, { user }), {
          name: 'Forbidden',
          message: 'You do not have the correct permissions.'
        });
      });
    });

    describe('external calls', () => {
      it('throws an error when no entity is available', async () => {
        const params = { provider: 'test' };

        await assert.rejects(async () => {
          await app.service('messages').create({ text: 'hello' }, params);
        }, {
          name: 'Forbidden',
          message: 'You do not have the correct permissions (invalid permission entity).',
          code: 403,
          className: 'forbidden',
          data: undefined,
          errors: {}
        });
      });

      it('throws an error when entity is available but has no permissions', async () => {
        const params = {
          provider: 'test',
          user: {
            email: 'someuser@example.com'
          }
        };

        await assert.rejects(async () => {
          await app.service('messages').create({ text: 'hello' }, params);
        }, {
          name: 'Forbidden',
          message: 'You do not have the correct permissions.',
          code: 403,
          className: 'forbidden',
          data: undefined,
          errors: {}
        });
      });

      describe('successful permission', () => {
        ['*', 'admin:*', '*:create', 'admin:create'].forEach(permission => {
          it(`allows the '${permission}' permission as array`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            const result = await app.service('messages').create({ text: 'hello' }, params);

            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello'
            });
          });

          it(`allows the '${permission}' permission as string`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: `something:create , ${permission}`
              }
            };

            const result = await app.service('messages').create({ text: 'hello' }, params);

            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello'
            });
          });
        });
      });

      describe('unsuccessful permission', () => {
        ['user:*', '*:update', 'admin:find'].forEach(permission => {
          it(`fails the '${permission}' permission`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            await assert.rejects(async () => {
              await app.service('messages').create({ text: 'hello' }, params);
            }, {
              name: 'Forbidden',
              message: 'You do not have the correct permissions.',
              code: 403,
              className: 'forbidden',
              data: undefined,
              errors: {}
            });
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
          async roles (context) {
            return ['admin', context.path];
          }
        })
      });
      app.use('/messages', memory());
    });

    describe('internal calls', () => {
      it('does nothing when no entity is available', async () => {
        const result = await app.service('messages').create({ text: 'hello' });

        assert.deepStrictEqual(result, {
          id: 0,
          text: 'hello'
        });
      });
    });

    describe('external calls', () => {
      it('throws an error when no entity is available', async () => {
        const params = { provider: 'test' };

        await assert.rejects(async () => {
          await app.service('messages').create({ text: 'hello' }, params);
        }, {
          name: 'Forbidden',
          message: 'You do not have the correct permissions (invalid permission entity).',
          code: 403,
          className: 'forbidden',
          data: undefined,
          errors: {}
        });
      });

      it('throws an error when entity is available but has no permissions', async () => {
        const params = {
          provider: 'test',
          user: {
            email: 'someuser@example.com'
          }
        };

        await assert.rejects(async () => {
          await app.service('messages').create({ text: 'hello' }, params);
        }, {
          name: 'Forbidden',
          message: 'You do not have the correct permissions.',
          code: 403,
          className: 'forbidden',
          data: undefined,
          errors: {}
        });
      });

      describe('successful permission', () => {
        ['*', 'messages:*', '*:create', 'messages:create'].forEach(permission => {
          it(`allows the '${permission}' permission as array`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            const result = await app.service('messages').create({ text: 'hello' }, params);

            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello'
            });
          });

          it(`allows the '${permission}' permission as string`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: `something:create , ${permission}`
              }
            };

            const result = await app.service('messages').create({ text: 'hello' }, params);

            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello'
            });
          });

          it('works with nested field', async () => {
            const app = feathers();
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                deeply: {
                  nested: ['something:create', permission]
                }
              }
            };

            app.use('/dummy', memory());

            app.service('dummy').hooks({
              before: checkPermissions({
                roles: [permission],
                field: 'deeply.nested'
              })
            });
            const result = await app.service('dummy').create({ text: 'hello' }, params);

            assert.deepStrictEqual(result, {
              id: 0,
              text: 'hello'
            });
          });
        });
      });

      describe('unsuccessful permission', () => {
        ['user:*', '*:update', 'messages:find'].forEach(permission => {
          it(`fails the '${permission}' permission`, async () => {
            const params = {
              provider: 'test',
              user: {
                email: 'someuser@example.com',
                permissions: ['something:create', permission]
              }
            };

            await assert.rejects(async () => {
              await app.service('messages').create({ text: 'hello' }, params);
            }, {
              name: 'Forbidden',
              message: 'You do not have the correct permissions.',
              code: 403,
              className: 'forbidden',
              data: undefined,
              errors: {}
            });
          });
        });
      });
    });
  });
});
