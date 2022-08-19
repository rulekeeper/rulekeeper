const contextService = require('request-context');
const dataTransferControlHook = require('./data_transfer');
const dataOwnershipControlHook = require('./data_ownership');
const anonymousRequestsControlHook = require('./anonymous_requests');
const mongooseMiddleware = require('../config/mongoose_middleware');

module.exports = function hooks(schema, options) {
  /**
   * Mongoose hook for setting the context throughout the mongoose middleware
   */
  schema.pre(mongooseMiddleware.getAllMongooseFunctions(), // pre('*')
    { document: true, query: true },
    function (next) {
      this.rulekeeper = contextService.getContext('rulekeeper'); // setting the context
      this.request = contextService.getContext('request');
      this.response = contextService.getContext('response');
      const { operation } = this.rulekeeper || {};
      const isInternalQuery = contextService.getContext('isInternalQuery');
      if (operation === undefined || isInternalQuery) this.internalQuery = true; // internal query
      next();
    });

  anonymousRequestsControlHook(schema, options);

  dataOwnershipControlHook(schema, options);

  dataTransferControlHook(schema, options);
};
