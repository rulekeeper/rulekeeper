/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
const flatten = require('flat');
const PolicyManager = require('../pep/PolicyManager');
const logger = require('../utils/logger');
const hookUtils = require('./utils');

const mongooseMiddleware = require('../config/mongoose_middleware');
const { startTime, getDurationInMilliseconds } = require("../timeUtils");

module.exports = function dataTransfer(schema) {
  /**
   * Mongoose hooks for data transfer control with policy enforcement.
   *
   * These hooks intercept the request in two moments:
   *  1. After the query was executed in the database in case of a READ.
   *     The reason for doing it so, is to check the data returned by the query.
   *  2. Before the query is executed in the database in case of CREATE, UPDATE and DELETE.
   *     The reason for doing it so, is to prevent the query from being executed without permission.
   *
   * Note: In mongoose there are several types of hooks: Query, Document and Model,
   * and several types of operations: CRUD operations, which differ in the logic.
   *
   * The first hook supports READ Operations.
   * The second hook supports operations on documents.
   * The third hook supports UPDATE, CREATE and DELETE Operations (on queries).
   *
   * Protocol READ:
   * 1. Get context of the request - whose principal made the request and the request object.
   * 2. Get the data fetched from the database.
   * 3. Evaluate the request using the data transfer policy.
   * 4. End the request if the result of the evaluation is false (not allowed).
   *
   * Protocol POST:
   * 1. Get context of the request - whose principal made the request and the request object.
   * 2. Get the data updated and used in the request (filter + update object).
   * 3. Evaluate the request using the data transfer policy.
   * 4. End the request if the result of the evaluation is false (not allowed).
   */
  schema.post(mongooseMiddleware.getMongooseReadOperations(),
    function (doc, next) {
      const start = startTime();
      if (this.internalQuery || !this.hasPersonalData) { next(); return; }
      logger.info('Checking for data transfer authorization (READ).', '[Data Transfer Control - Hook]');
      if (!doc) { next(); return; }
      const document = doc;

      /* 1. Get context of request */
      const { rulekeeper, response } = this;
      const { principal, operation } = rulekeeper || {};


      /* 2. Get data fetched from the database. */
      let data;
      // If data is an array of documents, we want the flatten keys of the first document - TODO, as documents can have different keys, we should merge all keys.
      if (Array.isArray(document) && document[0]) {
        if (typeof document[0].toObject === 'function') data = hookUtils.getFlatKeys(document[0].toObject())
        else data = hookUtils.getFlatKeys(document[0])
      }
      // If data is a single document
      else {
        if (typeof document.toObject === 'function') data = hookUtils.getFlatKeys(document.toObject())
        else data = hookUtils.getFlatKeys(document)
      }
      /* Get table */
      const hasPersonalData = PolicyManager.checkPersonalData(this);
      const table = hasPersonalData? hasPersonalData.table : null

      /* 3. Evaluate the request using the data transfer policy. */
      const result = PolicyManager
        .evaluateDataTransferControl(principal, operation, data, table, this.subjects);
      if (!result) {
        response.status(404).end('Access Denied: Data Transfer not allowed.');
        return;
      }
      getDurationInMilliseconds(start)
      next(); return;
    });

  schema.pre(mongooseMiddleware.getMongooseDocumentOperations(), { document: true },
    function (next) {
      const start = startTime()
      if (this.internalQuery) { next(); return; }
      logger.info('Checking for data transfer authorization (DOCUMENT).', '[Data Transfer Control - Hook]');
      const document = this._doc;
      if (!document) { next(); return; }

      /* 1. Get context of request */
      const { rulekeeper, response } = this;
      const { principal, operation } = rulekeeper || {};

      /* 2. Get the data updated and used in the request (filter + update object). */
      const data = Object.keys(flatten(this.toJSON()));
      /* Get table */
      const hasPersonalData = PolicyManager.checkPersonalData(this);
      if (!hasPersonalData) { next(); return; }
      const table = hasPersonalData? hasPersonalData.table : null

      /* 3. Evaluate the request using the data transfer policy. */
      const result = PolicyManager.evaluateDataTransferControl(principal, operation, data, table, this.subjects);
      if (!result) {
        response.status(404).end('Access Denied: Data Transfer not allowed.');
        return;
      }
      getDurationInMilliseconds(start)
      next(); return;
    });

  schema.pre(mongooseMiddleware.getMongooseUpdateOperations(), { document: false, query: true },
    function (next) {
      const start = startTime()
        if (this.internalQuery || !this.hasPersonalData) { next(); return; }
      logger.info('Checking for data transfer authorization (UPDATE).', '[Data Transfer Control - Hook]');
      /* 1. Get context of request */
      const { rulekeeper, response } = this;
      const { principal, operation } = rulekeeper || {};

      /* 2. Get the data updated and used in the request (filter + update object). */
      const data = hookUtils.getDataFromUpdate(this);

      /* Get table */
      const hasPersonalData = PolicyManager.checkPersonalData(this);
      const table = hasPersonalData? hasPersonalData.table : null

      /* 3. Evaluate the request using the data transfer policy. */
      const result = PolicyManager
        .evaluateDataTransferControl(principal, operation, data, table, this.subjects);
      if (!result) {
        response.status(404).end('Access Denied: Data Transfer not allowed.');
        return;
      }
      getDurationInMilliseconds(start)
      next(); return;
    });
};
