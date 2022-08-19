const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const PolicyManager = require('../pep/PolicyManager');
require('dotenv').config({ path: '.env' });

/**
 * The Event Manager component is responsible for managing the events to and from the manager instance.
 */

/* RuleKeeper middleware instance socket */
let socketIO;

module.exports = {
  /**
   * Initializes the event manager - connects to the manager and sets the events.
   */
  init() {
    const url = process.env.SERVER_URL;
    if (!url) {
      logger.error('RuleKeeper Manager URL invalid.', '[Event Manager');
      return;
    }
    const certificate = fs.readFileSync(path.join(__dirname, '../config/server.cert'));
    /* Tries to connect securely to the manager socket */
    socketIO = io.connect(process.env.SERVER_URL, { secure: true, ca: certificate, rejectUnauthorized: false });
    if (!socketIO || !socketIO.io) logger.error('Unable to connect to RuleKeeper Manager', '[Event Manager');
    else {
      socketIO.on('connect', () => {
        logger.success(`Socket ID attributed: ${socketIO.id}.`, '[Event Manager]');
        logger.success(`Event Manager connected to ${socketIO.io.uri}.`, '[Event Manager]');
      });
      /* Sets events */
      setOnInstallPolicyEvent();
      setOnInstallDataPolicyEvent();
      setOnUpdateDataEvent();
    }
  },

  sendNewAnonymousEntity(cookie, entity) {
    logger.info(`[Send] Add new anonymous entity: ${cookie}, ${entity}`, '[Event Manager]');
    socketIO.emit('new-anonymous-entity', cookie, entity);
  },

  sendNewUserEvent(userId, role, entity) {
    logger.info(`[Send] New user: ${userId}, ${role}, ${entity}`, '[Event Manager]');
    socketIO.emit('new-user', userId, role, entity);
  },

  sendChangeUserRoleEvent(userId, role) {
    logger.info(`[Send] Change user role: ${userId}, ${role}`, '[Event Manager]');
    socketIO.emit('change-role', userId, role);
  },

  sendChangeUserEntityEvent(userId, entity) {
    logger.info(`[Send] Change user entity: ${userId}, ${entity}`, '[Event Manager]');
    socketIO.emit('change-entity', userId, entity);
  },

  sendRemoveUserEvent(userId) {
    logger.info(`[Send] Remove user: ${userId}`, '[Event Manager]');
    socketIO.emit('remove-user', userId);
  },
};

function setOnInstallDataPolicyEvent() {
  socketIO.on('install-data', (content) => {
    logger.info('Received policy data', '[Event Manager]');
    PolicyManager.updatePolicyData(content)
  });
}

function setOnUpdateDataEvent() {
  socketIO.on('update-data', (data) => {
    logger.info('Received updated data', '[Event Manager]');
    PolicyManager.updateData(data.data, data.type)
  });
}

function setOnInstallPolicyEvent() {
  socketIO.on('install-policy', (name, version, content, fn) => {
    logger.info(`Received install policy event - ${name}.`, '[Event Manager]');

    const updated = PolicyManager.updatePolicy(name, version, content);
    fn(name, updated);
  });
}
