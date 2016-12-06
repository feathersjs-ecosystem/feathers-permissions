import errors from 'feathers-errors';
import Debug from 'debug';

const debug = Debug('feathers-permissions:express:is-permitted');

export default function isPermitted () {
  return function (req, res, next) {
    debug('Checking for permitted request');

    if (req.__isPermitted || req.feathers.__isPermitted) {
      return next();
    }

    next(new errors.Forbidden('You do not have the correct permissions.'));
  };
}
