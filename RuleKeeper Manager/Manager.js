const EventManager = require('./events/EventManager');
const PolicyManager = require('./policies/PolicyManager');

/**
 * The Manager is the component that all components except EventManager and PolicyManager
 * (due to circular dependency) use in order to deal with policies and events.
 * It is also responsible to initialize both components.
 * @type {{init(*=): this, updatePolicyData(*=): void}}
 */
module.exports = {

  /**
   * This function initializes the PolicyManager and the EventManager
   * @param io - connection socket.
   * @returns {module.exports}
   */
  init(io) {
    EventManager.init(io);
    PolicyManager.init();
    return this;
  },

  /**
   * This function updates the dynamic data required for the policy enforcement
   * (principals, entities, consents) and emits the message to all local connected systems.
   * @param data
   * @param updateType
   */
  updatePolicyData(data, updateType) {
    const bufferedData = Buffer.from(JSON.stringify(data));
    EventManager.broadcastMessage('update-data', { data: bufferedData, type: updateType });
  },
};
