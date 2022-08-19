/**
 * This file is responsible for exposing an that is called from the event manager.
 * It exists due to circular dependencies.
 * EventManager -> dataManagement -> Manager -> EventManager (check internalDataManagement)
 * Calls: dataUpdateHelper
 * */

const dataUpdateHelper = require('../policies/utils/dataUpdateHelper');

module.exports = {

  async addAnonymousEntity(cookie, entity) {
    /* Update principal */
    return dataUpdateHelper.addAnonymousEntity(cookie, entity);
  },
};
