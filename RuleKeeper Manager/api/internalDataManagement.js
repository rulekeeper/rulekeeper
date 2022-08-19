/**
 * This file is responsible for exposing an api that updates the data (database and file)
 * and then sends the update to the event manager.
 * Calls: dataUpdateHelper
 * */

const dataUpdateHelper = require('../policies/utils/dataUpdateHelper');
const utils = require('../utils/app');

module.exports = {

  async addConsent(entity, purposes, req, res) {
    /* Update consent (in database and file) */
    const data = await dataUpdateHelper.updateConsent(entity, purposes);
    if (data) {
      /* Send update to middleware */
      const manager = utils.getManager(req, res);
      if (!manager) return;
      manager.updatePolicyData(data, 'consent');
    }
  },

  async addCookieConsent(cookie, purposes, req, res) {
    /* Update consent (in database and file) */
    const data = await dataUpdateHelper.updateCookieConsent(cookie, purposes);
    if (data) {
      /* Send update to middleware */
      const manager = utils.getManager(req, res);
      if (!manager) return;
      manager.updatePolicyData(data, 'consent');
    }
  },
};
