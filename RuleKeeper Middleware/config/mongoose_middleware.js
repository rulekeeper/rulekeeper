/**
 * Mongoose operations that correspond to READs in the database.
 * @type {string[]}
 */
const mongooseGetOperations = ['find', 'findById', 'findOne', /count/i, 'distinct'];

/**
 * Mongoose operations that correspond to UPDATEs in the database.
 * @type {string[]}
 */
const mongooseUpdateOperations = [/update/, 'replaceOne', 'findOneAndUpdate', 'findOneAndReplace'];

/**
 * Mongoose operations that correspond to DELETEs in the database.
 * @type {RegExp[]}
 */
const mongooseDeleteOperations = [/delete/i, /remove/i];

/**
 * Mongoose operations that correspond to changes in the database regarding documents.
 * @type {string[]}
 */
const mongooseDocumentOperations = ['save', 'remove'];

module.exports = {
  getMongooseReadOperations() {
    return mongooseGetOperations;
  },
  getMongooseUpdateOperations() {
    return mongooseUpdateOperations;
  },
  getMongooseDeleteOperations() {
    return mongooseDeleteOperations;
  },
  getMongooseDocumentOperations() {
    return mongooseDocumentOperations;
  },
  getMongooseQueryOperations() {
    return ([]).concat(mongooseGetOperations, mongooseDeleteOperations, mongooseUpdateOperations);
  },
  getAllMongooseFunctions() {
    return ([]).concat(mongooseGetOperations, mongooseDeleteOperations,
      mongooseDocumentOperations, mongooseUpdateOperations);
  },
  getMongoosePostOperations() {
    return ([]).concat(mongooseDeleteOperations, mongooseUpdateOperations);
  },
};
