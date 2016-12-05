import { expect } from 'chai';
import { checkPermissions } from '../../src/hooks';

describe('hooks:checkPermissions', () => {
  let hook;

  beforeEach(() => {
    hook = {
      id: 1,
      type: 'before',
      method: 'get',
      app: {
        get: () => {}
      },
      params: {
        user: {},
        provider: 'rest'
      }
    };
  });

  describe('when namespaces is missing', () => {
    it('returns an error', () => {
      return checkPermissions()(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when on is missing', () => {
    it('returns an error', () => {
      const options = { service: 'users', on: null };
      return checkPermissions(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when field is missing', () => {
    it('returns an error', () => {
      const options = { service: 'users', field: null };
      return checkPermissions(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when not called as a before hook', () => {
    it('returns an error', () => {
      hook.type = 'after';
      return checkPermissions('users')(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when correct options are provided', () => {
    let options;
    beforeEach(() => {
      options = { service: 'users' };
    });

    describe('when not params.provider is missing', () => {
      it('does nothing', () => {
        delete hook.params.provider;
        return checkPermissions(options)(hook).then(returnedHook => {
          expect(returnedHook).to.deep.equal(hook);
        });
      });
    });

    describe('when entities to check are missing', () => {
      it('does nothing', () => {
        options.on = 'device';
        return checkPermissions(options)(hook).then(returnedHook => {
          expect(returnedHook).to.deep.equal(hook);
        });
      });
    });

    describe('when entity to check is present', () => {
      describe('when permissions are missing', () => {
        it('does nothing', () => {
          return checkPermissions(options)(hook).then(returnedHook => {
            expect(returnedHook).to.deep.equal(hook);
          });
        });
      });

      describe('when permissions are present', () => {
        describe('when entity does not have required permissions', () => {
          it('does nothing', () => {
            hook.params.user.permissions = ['incorrect'];
            return checkPermissions(options)(hook).then(returnedHook => {
              expect(returnedHook).to.deep.equal(hook);
            });
          });
        });

        describe('when entity has wildcard permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['*'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has matched group permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['admin'];
            options.group = 'admin';
            delete options.service;
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.permitted).to.equal(true);
            });
          });
        });
        describe('when entity has matched role permission', () => {
          it('sets hook.params.permitted', () => {
            hook.params.user.role = 'admin';
            options.field = 'role';
            options.roles = ['admin'];
            delete options.service;
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has method wildcard permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['users:*'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has service wildcard permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['*:get'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has service:method permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['users:get'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has service:*:id permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['users:*:1'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        describe('when entity has service:method:id permission', () => {
          it('sets hook.params.__isPermitted', () => {
            hook.params.user.permissions = ['users:get:1'];
            return checkPermissions(options)(hook).then(hook => {
              expect(hook.params.__isPermitted).to.equal(true);
            });
          });
        });

        it('supports permissions as a string', () => {
          hook.params.user.permissions = 'users:get:1,users:get:2';
          return checkPermissions(options)(hook).then(hook => {
            expect(hook.params.__isPermitted).to.equal(true);
          });
        });
      });
    });
  });
});
