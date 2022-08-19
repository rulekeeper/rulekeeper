const contextService = require('request-context');
const PolicyManager = require('../pep/PolicyManager');
const logger = require('../utils/logger');
const { startTime, getDurationInMilliseconds } = require("../timeUtils");

module.exports = {
  addAccessControlHook(app) {
    app.use(this.accessControlHandler);
  },

  accessControlHandler: (req, res, next) => {
    const start = startTime()
    const rulekeeper = contextService.getContext('rulekeeper');
    const { principal, operation } = rulekeeper;

    if (!operation) {
      logger.error('Missing context in request.', '[Access Control Hook]');
      res.status(401).json('Access Denied: Missing context in request.');
    } else {
      const result = PolicyManager.evaluateAccessControl(principal, operation);
      getDurationInMilliseconds(start)
      if (result) next();
      else res.status(404).end('Access Denied: Operation not allowed');
    }
}
};
