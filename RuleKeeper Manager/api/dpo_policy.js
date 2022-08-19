const logger = require('../utils/logger');
const utils = require('../utils/app');
require('dotenv').config({ path: '.env' });

module.exports = {

  updatePrivacyPolicy(req, res) {
    logger.info('Received request to update privacy policy by DPO.', '[DPO]');

    /* Read file from request */
    if (!req.files || !Object.keys(req.files) || !req.files.file) {
      logger.error('Missing file to upload.', '[DPO]');
      res.status(400).json('Missing file to upload.');
      return;
    }

    /* TO-DO - Verify Policy Data */

    /* Upload privacy_policy.json file */
    const manager = utils.getManager(req, res);
    if (!manager) return;
    manager.updatePrivacyPolicy(req.files.file.data);

    res.sendStatus(200);
  },

  updatePolicyFile(req, res) {
    logger.info('Received request to update policy file by DPO.', '[DPO]');

    if (!req.params.name) {
      logger.error('Missing file name in request parameters.', '[DPO]');
      res.status(400).json('Missing file name in request parameters.');
    }

    /* Read file from request */
    if (!req.files || !Object.keys(req.files)) {
      logger.error('Missing file to upload.', '[DPO]');
      res.status(400).json('Missing file to upload.');
    }

    // Verify Policy Data

    // Update privacy_policy.json file

    // Send event to gdpr local managers

    res.sendStatus(200);
  },
};
