const fs = require('fs');
const path = require("path");
const logger = require('../utils/logger');

module.exports = {
  getVersion(policyName) {
    if (!fs.existsSync(path.join(__dirname, 'versions.json'))) {
      logger.error('Policy version control file not found.', '[Version Manager]');
      return;
    }

    const fileContent = fs.readFileSync(path.join(__dirname, 'versions.json'));
    const jsonContent = fileContent.length ? JSON.parse(fileContent.toString()) : {};
    const currentFileVersion = jsonContent[policyName];
    logger.success(`Current version ${policyName}: ${currentFileVersion}.`, '[Version Manager]');
    return currentFileVersion || 0;
  },
  updateVersion(policyName, newVersion) {
    if (!fs.existsSync(path.join(__dirname, 'versions.json'))) {
      logger.error('Versions file not found.', '[Policy Manager]');
      return;
    }
    const versions = fs.readFileSync(path.join(__dirname, 'versions.json'));
    const policyConfig = !versions ? {} : JSON.parse(versions.toString());
    policyConfig[policyName] = newVersion;
    fs.writeFileSync(path.join(__dirname, 'versions.json'), Buffer.from(JSON.stringify(policyConfig)));
  }
}
