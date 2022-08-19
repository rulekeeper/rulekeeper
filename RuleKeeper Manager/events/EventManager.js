const logger = require('../utils/logger');
const PolicyManager = require('../policies/PolicyManager');
const { dataManagementController } = require('../api');

/**
 * The Event Manager component is responsible for managing the events to and
 * from the middleware instances.
 */

/* Manager socket */
let io;

module.exports = {
  /**
   * Initializes the socket instance - associates the opened socket with the Manager instance
   */
  init(socket) {
    if (socket) {
      io = socket;
      const { _path } = socket;
      setConnectionEvent();
      logger.success(`Socket ${_path} correctly initialized.`, '[Event Manager]');
    } else {
      logger.error('Unable to initialize socket.', '[Event Manager]');
    }
  },

  broadcastMessage(event, message) {
    io.emit(event, message);
  },

  updatePolicyData() {
    updatePolicyData();
  },
};

/**
 * Sets the action that runs in case of a connection event.
 * When a new middleware instance connects, the Manager sends it the updated version
 * of the policies/data (if outdated).
 */
function setConnectionEvent() {
  io.on('connection', (socket) => {
    logger.info(`Socket ${socket.id} connected`, '[Event Manager]');
    installSocket(socket);
    setUpdateDataEvents(socket);
  });
}

function setUpdateDataEvents(socket) {
  setAddAnonymousEntityEvent(socket);
}

/**
 * Responsible for updating the data and policies of a middleware instance.
 * @param socket
 */
function installSocket(socket) {
  /* 1. The manager first sends the data file. The data is sent before the policies,
  so that the policies do not have to update the data twice. */
  const policyData = PolicyManager.getPolicyData();
  const data = Buffer.from(JSON.stringify(policyData));
  socket.emit('install-data', data, () => {
    logger.info(`Client ${socket.id} received policy data.`, '[Event Manager]');
  });
  /* 2. The manager sends the RuleKeeper policies */
  const policyFiles = PolicyManager.getPolicyFiles();
  for (let i = 0; i < policyFiles.length; i += 1) {
    socket.emit('install-policy', policyFiles[i].name, policyFiles[i].version, policyFiles[i].content, (name, updated) => {
      if (updated) logger.info(`Client ${socket.id} updated policy ${name}`, '[Event Manager]');
      else logger.info(`Client ${socket.id} did not update policy ${name}`, '[Event Manager]');
    });
  }
}

function updatePolicyData() {
  /* 1. The manager first sends the data file. The data is sent before the policies,
  so that the policies do not have to update the data twice. */
  PolicyManager.getPolicyData().then((policyData) => {
    const data = Buffer.from(JSON.stringify(policyData));
    io.emit('install-data', data, () => {
      logger.info('Sent policy data to all middleware.', '[Event Manager]');
    });
  });
}

/* Events to update data */

function setAddAnonymousEntityEvent(socket) {
  socket.on('new-anonymous-entity', async (cookie, entity) => {
    logger.info(`Received new anonymous entity event with params: cookie: ${cookie} and entity: ${entity}.`, 'Event Manager:');
    const newData = await dataManagementController.addAnonymousEntity(cookie, entity);
    const policy = PolicyManager.getPolicy();
    const bufferedData = Buffer.from(JSON.stringify({ ...policy, ...newData }));
    io.emit('install-data', bufferedData);
  });
}
