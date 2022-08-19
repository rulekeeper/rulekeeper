const debug = require('debug')('RULEKEEPER');
require('colors');

module.exports = {
  info(message, worker = '') {
    debug(`${worker}: ${message.blue}`);
  },
  error(message, worker = '') {
    debug(`${worker}: ${message.red}`);
  },
  success(message, worker = '') {
    debug(`${worker}: ${message.green}`);
  },
};
