// import errors from 'feathers-errors';
// import Debug from 'debug';
const Debug = require('debug');
const debug = Debug('feathers-permissions:filters:is-permitted');

module.exports = function isPermitted () {
  return function (data, connection, hook) {
    if (data.__isPermitted) {
      debug('Connection is permitted. Dispatching event.');
      return data;
    }

    debug('Connection is not permitted.');
    return false;
  };
};
