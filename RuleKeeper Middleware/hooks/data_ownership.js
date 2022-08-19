/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
const PolicyManager = require('../pep/PolicyManager');
const logger = require('../utils/logger');
const hookUtils = require('./utils');
const dataHelper = require('../pep/DataHelper')
const contextService = require('request-context');
const NodeCache = require('node-cache');
const crypto = require('crypto')

const mongooseMiddleware = require('../config/mongoose_middleware');
const { startTime, getDurationInMilliseconds} = require("../timeUtils");

const rulekeeperCache = new NodeCache({ useClones: false, checkperiod: 30, stdTTL: 20 });

module.exports = function dataOwnership(schema) {
  /**
   * Mongoose hooks to differentiate accesses to the data regarding the ownership of the data.
   *
   * Beyond the policy enforcement hook, there's a need to allow/disallow the access to
   * other people's data.
   * This means that the data subject can only access its data but the other entities (in the GDPR)
   * don't have restrictions. Besides this, if the principal represents other entity in the GDPR,
   * it is needed to have a list of the subjects to whom the data belong,
   * in order to evaluate the authorization.
   *
   * If the entity is data subject and it's not the owner of the data, disallow.
   * If the entity is one of the others - allow and add a list of subjects.
   * If the entity does not have a gdpr role - disallow.
   *
   * Note: This also solves a mongoose problem regarding the nondeterministic queries.
   *
   * The first hook is for document operations.
   * The second hook is for query update/read operations.
   *
   */
  schema.pre(mongooseMiddleware.getMongooseDocumentOperations(), { document: true, query: false },
    function (next) {
      const start = startTime()
      if (this.internalQuery) { next(); return; }
      const { rulekeeper, response, _doc } = this;
      const { principal } = rulekeeper || {};

      /* Get principal context: entity and role */
      const context = PolicyManager.getPrincipalContext(principal);
      const hasPersonalData = PolicyManager.checkPersonalData(this);
      if (!hasPersonalData) { next(); return; }

      if (isDataSubject(context)) {
        const isOwner = checkDocumentOwner(context, this, _doc);
        if (!isOwner) { disallowQuery(response); return; }
        else {
          logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
          getDurationInMilliseconds(start)
          next(); return;
        }
      }
      else if (isAuthorized(context)) {
        setDocumentSubject(this, false, _doc);
        logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
        getDurationInMilliseconds(start)
        next(); return;
      }
      else if (!context || !context.roles) {
        logger.error('Principal does not have associated gdpr role ✗', '[Data Ownership Control - Hook]');
        getDurationInMilliseconds(start)
        next(); return;
      }
    });

  //TODO: Should be post
  schema.post(mongooseMiddleware.getMongooseReadOperations(), { document: false, query: true },
    function (doc, next) {
      const start = startTime()
      if (this.internalQuery) { next(); return; }
      const { rulekeeper, response } = this;
      const { principal } = rulekeeper || {};

      /* Get principal context: entity and role */
      const context = PolicyManager.getPrincipalContext(principal);
      const hasPersonalData = PolicyManager.checkPersonalData(this);
      if (!hasPersonalData) { next(); return; }
      this.hasPersonalData = hasPersonalData;

      // MAJOR CHANGE. CHECK IF DID NOT BREAK FUNCTIONALITY
      const { setCache, subjects } = setSubjects(this, true, hasPersonalData);
      Promise.resolve(subjects).then((results) => {
        if (setCache) rulekeeperCache.set(setCache, results);
        if (contextService.getContext('rulekeeper')) contextService.setContext('isInternalQuery', false);
        const isOwner = results.list && results.list.length === 1 && results.list[0] === context.entity;//hookUtils.checkQueryOwnership(results, hasPersonalData, context);
        if (isOwner) {
          logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
          getDurationInMilliseconds(start)
          next(); return;
        }
        this.subjects = {}
        this.subjects.key = 'principal';
        this.subjects.list = hookUtils.generateSimpleArray(results, hasPersonalData.column);
        logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
        getDurationInMilliseconds (start)
        next(); return;
      });
    });

  schema.pre(mongooseMiddleware.getMongooseUpdateOperations(), { document: false, query: true },
    function (next) {
      const start = startTime()
      if (this.internalQuery) { next(); return; }
      const { rulekeeper, response } = this;
      const { principal } = rulekeeper || {};

      const hasPersonalData = PolicyManager.checkPersonalData(this);
      if (hasPersonalData == null) { next(); return; }
      this.hasPersonalData = hasPersonalData;

      /* Get principal context: entity and role */
      const context = PolicyManager.getPrincipalContext(principal);

      const { setCache, subjects } = setSubjects(this, true, hasPersonalData);
      Promise.resolve(subjects).then((results) => {
        if (setCache) rulekeeperCache.set(setCache, results);
        if (contextService.getContext('rulekeeper')) contextService.setContext('isInternalQuery', false);
        const isOwner = results.list && results.list.length === 1 && results.list[0] === context.entity;//hookUtils.checkQueryOwnership(results, hasPersonalData, context);
        if (isOwner) {
          logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
          getDurationInMilliseconds(start)
          next(); return;
        }
        this.subjects = {}
        this.subjects.key = 'principal';
        this.subjects.list = hookUtils.generateSimpleArray(results, hasPersonalData.column);
        logger.success('Data Transfer pre-authorized ✓', '[Data Ownership Control - Hook]');
        getDurationInMilliseconds (start)
        next(); return;
      });
    });

};

function checkDocumentOwner(context, object, doc) {
  const hasPersonalData = PolicyManager.checkPersonalData(object);
  //if (!hasPersonalData) { return true; } // add property to data_transfer pep
  return hookUtils.checkDocumentOwnership(doc, hasPersonalData, context);
}

function checkReadQueryOwner(context, object, hasPersonalData) {
  // Get Subject
  const { column, table } = hasPersonalData;
  const filter = Object.assign({}, object._conditions);

  // Check if query filter already has the owner information (optimization step)
  const key = hasPersonalData['column']

  if (filter.hasOwnProperty(key))
      return { setCache: false, subject: { [key]: filter[key] }}

  // Check if value in cache
  const cacheKey = JSON.stringify(filter)
  const hash = crypto.createHash('sha1').update(cacheKey).digest('base64');
  const subject = rulekeeperCache.get(hash);
  if (subject === undefined) return { setCache: hash, subject: dataHelper.getSubjectData(table, column, filter) };
  else return {  setCache: false, subject: subject };
}

function setSubjects(query, filter, hasPersonalData) {
  // Get Subjects
  filter? filter = query.getFilter() : filter = {};
  const { column, table } = hasPersonalData;

  /* Check if value in cache */
  const cacheKey = JSON.stringify(filter)
  const hash = crypto.createHash('sha1').update(cacheKey).digest('base64');
  const subjects = rulekeeperCache.get(hash);
  if (subjects === undefined) return { setCache: hash, subjects: dataHelper.getSubjects(table, column, filter) };
  else return {  setCache: false, subjects: subjects };
}

function setDocumentSubject(query, filter, doc, personalData) {
  if (!personalData) { return true; }
  const subject = hookUtils.getNestedValue(doc, personalData.column)
  query.subjects = {}
  query.subjects.key = 'principal';
  query.subjects.list = [subject];

}

function isAuthorized(context) {
  return context && context.roles
    && ( context.roles.includes('Data Controller')
      || context.roles.includes('Data Processor')
      || context.roles.includes('Third Party'));
}

function isDataSubject(context) {
  return context && context.roles && context.roles.includes('Data Subject');
}

function disallowQuery(response) {
  response.status(404).end('Access Denied: Operation not allowed. Principal does own the data.');
  logger.error('Data subject does not own the data ✗', '[Data Ownership Control - Hook]');

}

