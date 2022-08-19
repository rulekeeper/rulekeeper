const logger = require('./logger');

module.exports = {

  getManager(req, res) {
    if (!req.app) {
      logger.error('Unable to get request application.', '[Controller]');
      res.status(400).json('Error in Manager.');
      return null;
    }
    const manager = req.app.get('manager');
    if (!manager) {
      logger.error('Unable to get manager.', '[Controller]');
      res.status(400).json('Error in Manager.');
      return null;
    }
    return manager;
  },
};
