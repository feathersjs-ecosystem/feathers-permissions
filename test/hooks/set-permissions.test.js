// import errors from 'feathers-errors';
import { expect } from 'chai';
import { setPermissions } from '../../src/hooks';

describe('hooks:setPermissions', () => {
  let service;
  let options;

  beforeEach(() => {
    service = {
      id: 'id',
      update: () => Promise.resolve()
    };

    options = {
      permissions: [
        'orgs:*:1234',
        'users:*:id'
      ]
    };
  });

  describe('when desired permissions are missing', () => {
    it('returns an error', () => {
      return setPermissions().catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when desired permissions is not an array', () => {
    it('returns an error', () => {
      return setPermissions({ permissions: true }).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when set on find method', () => {
    it('returns an error', () => {
      const hook = { method: 'find' };
      return setPermissions(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when set on get method', () => {
    it('returns an error', () => {
      const hook = { method: 'get' };
      return setPermissions(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when set on remove method', () => {
    it('returns an error', () => {
      const hook = { method: 'remove' };
      return setPermissions(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when called as a before hook', () => {
    let hook;

    beforeEach(() => {
      hook = {
        id: 1,
        type: 'before',
        method: 'create',
        data: { id: 1 }
      };
    });

    describe('when modifying a single entity', () => {
      it('adds permissions to hook.data', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:1'
        ];

        return setPermissions(options)(hook).then(hook => {
          expect(hook.data.permissions).to.deep.equal(expected);
        });
      });
    });

    describe('when modifying multiple entities', () => {
      it('adds permissions to each entity', () => {
        delete hook.id;
        hook.data = [
          { id: 1 },
          { id: 2 }
        ];

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.data[0].permissions).to.deep.equal([
            'orgs:*:1234',
            'users:*:1'
          ]);

          expect(hook.data[1].permissions).to.deep.equal([
            'orgs:*:1234',
            'users:*:2'
          ]);
        });
      });
    });

    describe('when self is false', () => {
      it('does not replace :id permissions', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:id'
        ];

        options.self = false;

        return setPermissions(options)(hook).then(hook => {
          expect(hook.data.permissions).to.deep.equal(expected);
        });
      });
    });

    describe('when asArray is false', () => {
      it('sets permissions as comma delimited string', () => {
        options.asArray = false;

        return setPermissions(options)(hook).then(hook => {
          expect(hook.data.permissions).to.equal('orgs:*:1234,users:*:1');
        });
      });
    });

    describe('when custom permissions field is provided', () => {
      it('sets permissions', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:1'
        ];

        options.field = 'custom';

        return setPermissions(options)(hook).then(hook => {
          expect(hook.data.custom).to.deep.equal(expected);
        });
      });
    });
  });

  describe('when called as an after hook', () => {
    let hook;

    beforeEach(() => {
      hook = {
        id: 1,
        type: 'after',
        method: 'create',
        result: { id: 1 }
      };
    });

    describe('when modifying a single entity', () => {
      it('adds permissions to hook.result', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:1'
        ];

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.result.permissions).to.deep.equal(expected);
        });
      });
    });

    describe('when modifying multiple entities', () => {
      it('adds permissions to each entity', () => {
        delete hook.id;
        hook.result = [
          { id: 1 },
          { id: 2 }
        ];

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.result[0].permissions).to.deep.equal([
            'orgs:*:1234',
            'users:*:1'
          ]);

          expect(hook.result[1].permissions).to.deep.equal([
            'orgs:*:1234',
            'users:*:2'
          ]);
        });
      });
    });

    describe('when self is false', () => {
      it('does not replace :id permissions', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:id'
        ];

        options.self = false;

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.result.permissions).to.deep.equal(expected);
        });
      });
    });

    describe('when asArray is false', () => {
      it('sets permissions as comma delimited string', () => {
        options.asArray = false;

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.result.permissions).to.equal('orgs:*:1234,users:*:1');
        });
      });
    });

    describe('when custom permissions field is provided', () => {
      it('sets permissions', () => {
        const expected = [
          'orgs:*:1234',
          'users:*:1'
        ];

        options.field = 'custom';

        return setPermissions(options).call(service, hook).then(hook => {
          expect(hook.result.custom).to.deep.equal(expected);
        });
      });
    });
  });
});
