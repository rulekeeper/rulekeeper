/**
 * This file is responsible for updating the database and data.json file.
 * Functions return the updated data.
 * Calls: queryHelper
 * */

const fs = require('fs');
const logger = require('../../utils/logger');
const queryHelper = require('./queryHelper');

module.exports = {

  /* Responsible for updating the consent in the database and in the data .json file */
  async updateConsent(entity, purposes) {
    /* Add new consent to the database */
    const newConsent = await queryHelper.addConsent(entity, purposes);
    /* Write new consent to file */
    if (newConsent) {
      const update = updateDataFile(newConsent, 'consent');
      if (update) return update.consents;
    }
    return null;
  },

  /* Responsible for updating the consent in the database and in the data .json file */
  async updateCookieConsent(cookie, purposes) {
    /* Add new consent to the database */
    const newConsent = await queryHelper.addCookieConsent(cookie, purposes);
    /* Write new consent to file */
    if (newConsent) {
      const update = updateDataFile(newConsent, 'consent');
      if (update) return update.consents;
    }
    return null;
  },

  /* Responsible for creating the necessary data to add a new anonymous entity */
  async addAnonymousEntity(cookie, entity) {
    /* Add new anonymous entity to the database */
    const newAnonymousEntity = await queryHelper.addAnonymousEntity(cookie, entity);
    /* Write new anonymous entity to file */
    if (newAnonymousEntity) {
      const update = updateDataFile(newAnonymousEntity, '*');
      return { principals: update.principals, entities: update.entities, consents: update.consents };
    }
    return null;
  },
};

function updateDataFile(data, type) {
  const dataFile = fs.readFileSync(`${process.env.DATA_FILE}`);
  const dataFileContent = JSON.parse(dataFile);
  if (type === 'principal') dataFileContent.principals.push(data);
  else if (type === 'entity') dataFileContent.entities.push(data);
  else if (type === 'consent') dataFileContent.consents.push(data);
  else if (type === '*') {
    dataFileContent.principals.push(data.principal);
    dataFileContent.entities.push(data.entity);
    dataFileContent.consents.push(data.consent);
  } else {
    logger.error(`Unable to update data.json file. Invalid type ${type}.`);
    return null;
  }
  fs.writeFileSync(process.env.DATA_FILE, JSON.stringify(dataFileContent));
  logger.success('Updated data.json file.');
  return dataFileContent;
}
