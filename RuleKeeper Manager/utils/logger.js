const debug = require('debug')('RuleKeeper');
require('colors');

debug.getDate = getDate;

module.exports = {
  info(message, worker = '') {
    debug(`${worker.blue} ${message.trim()}`);
  },
  error(message, worker = '') {
    debug(`${worker.blue} ${message.trim().red}`);
  },
  success(message, worker = '') {
    debug(`${worker.blue} ${message.trim().green}`);
  },
};

function getDate() {
  return `${new Date().toLocaleTimeString('pt-pt', { hour12: false })} `;
}
