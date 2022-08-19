/* eslint-disable no-prototype-builtins */
const contextService = require('request-context');
const logger = require('../utils/logger');
const ConnectionManager = require('../config/ConnectionManager')

module.exports = {
  /**
   * Get Policy Context of the current principal in the system
   * This includes: system role, gdpr entity and gdpr role.
   *
   * @param principalId
   * @param policyData
   */
  getPrincipalContext(principalId, policyData) {
    const context = { principal: principalId, entity: null, roles: null };
    if (!principalId) return context;

    /* Get entity associated with principal */
    //const entity = policyData.principals.find(entity => entity.principal === principalId).entity;
    const entity = policyData.principals[principalId].entity;
    if (entity) context.entity = entity;
    else { logger.error(`Principal ${principalId} does not have an associated entity.`); return context; }

    /* Get GDPR roles associated with the principal */
    // const roles = policyData.entities.find(roles => roles.entity === entity).roles;
    const roles = policyData.entities[entity].roles;
    if (roles) context.roles = roles;
    else { logger.error(`Entity of ${principalId} does not have an associated role.`); return context; }

    return context;
  },

  async getSubjects(table, column, filter) {
    if (contextService.getContext('rulekeeper')) contextService.setContext('isInternalQuery', true);
    const mongoose = ConnectionManager.getConnection();
    const model = Object.values(mongoose.models).find(model => model.collection.name === table);
    //const Model = mongoose.model(modelName);
    return model.find(filter, `-_id ${column}`).lean();
  },

  // TODO: If this returns more than one result, fail. There's no room for ambiguities
  async getSubjectData(table, column, filter) {
    if (contextService.getContext('rulekeeper')) contextService.setContext('isInternalQuery', true);
    const mongoose = ConnectionManager.getConnection();
    const model = Object.values(mongoose.models).find(model => model.collection.name === table);
    return model.findOne(filter, `-_id ${column}`).lean();
  },

  getOperationPurpose(operation, policyData) {
    const operationObject = policyData.operation_endpoints.find(op => op.endpoint === operation);
    if (!operationObject) return null
    const operationName = operationObject.operation;
    const operationData = policyData.operation_purposes.find(op => op.operation === operationName);
    if (operationData && operationData.purpose) return operationData.purpose;
    return null;
  },

  getPurposeData(purpose, policyData) {
    const purposeData = policyData.maximum_data.find(op => op.purpose === purpose);
    if (purposeData && purposeData.data) return purposeData.data;
    return null;
  }

};
