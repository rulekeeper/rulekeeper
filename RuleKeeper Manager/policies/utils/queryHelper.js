const mongoose = require('mongoose');
const assert = require('assert');
const logger = require('../../utils/logger');

const Principal = mongoose.model('principals');
const Entity = mongoose.model('entities');
const Consent = mongoose.model('consents');

module.exports = {

  /**
   * Getters.
   * Include: getPrincipals, getEntities and getConsent
   * */

  async getPrincipalInformation() {
    return Principal.find({}, '-__v -_id', (err) => {
      if (err) {
        logger.error('Unable to find principals.', '[Data Helper - Policy Manager]');
      }
    }).lean();
  },

  async getEntityInformation() {
    return Entity.find({}, '-__v -_id', (err) => {
      if (err) {
        logger.error('Unable to find entities.', '[Data Helper - Policy Manager]');
      }
    }).lean();
  },

  async getConsentInformation() {
    return Consent.find({}, '-__v -_id', (err) => {
      if (err) {
        logger.error('Unable to find consent.', '[Data Helper - Policy Manager]');
      }
    }).lean();
  },

  /**
   * Setters.
   * Include: updatePrincipal, updateEntity and updateConsent
   * */

  async addPrincipal(userId, role, entity) {
    const principal = role ? new Principal({ principal: userId, role, entity }) : new Principal({ principal: userId, entity });
    return principal.save();
  },

  async addEntity(entity, role) {
    const newEntity = new Entity({ entity, roles: [role] });
    return newEntity.save();
  },

  async addCookieConsent(cookie, purposes) {
    return Consent.findOneAndUpdate({ cookie },
      { $set: { purposes } }, { upsert: true, new: true }).lean();
  },

  async addConsent(entity, purposes) {
    return Consent.findOneAndUpdate({ dataSubject: entity },
      { $set: { purposes } }, { upsert: true, new: true, projection: { _id: 0, __v: 0 } }).lean();
  },

  // if there is already an entity dup the entry? TODO
  async addEntityToCookieConsent(cookie, entity) {
    return Consent.findOneAndUpdate({ cookie },
      { $set: { dataSubject: entity } }, { upsert: true, new: true }).lean();
  },

  /** Complex Queries - Transactions */
  async addAnonymousEntity(cookie, entity) {
    // Transactions are only available in replica sets TODO
    // const session = await mongoose.startSession();
    // session.startTransaction();

    /* Create new principal */
    const newPrincipal = await this.addPrincipal(cookie, null, entity);

    /* Create new entity */
    const newEntity = await this.addEntity(entity, 'Data Subject');

    /* Create new consent for cookie */
    const newConsent = await this.addEntityToCookieConsent(cookie, entity);

    if (newPrincipal && newEntity && newConsent) {
      return { principal: newPrincipal.toObject(), entity: newEntity.toObject(), consent: newConsent };
    }
    return null;

    // await session.commitTransaction();
    // session.endSession();
  },
};
