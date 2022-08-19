const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const logger = require('../utils/logger');
const helper = require('./utils/policyGenerationUtils');
const dataHelper = require('./utils/queryHelper');
require('dotenv').config({ path: '.env' });

module.exports = {
  /**
   * This function is responsible to initialize the Policy Manager which consists in
   * building the wasm policies and initializing the data (fetch from database).
   */
  init() {
    buildWasmPolicies();
    initData();
  },

  /**
   * Returns the wasm policies to send to the local managers.
   * @returns {[]} - array of wasm policies
   */
  getPolicyFiles() {
    logger.info('Fetching policy files...', '[Policy Manager]');
    const files = fs.readdirSync(process.env.WASM_DIR);
    if (!files) {
      logger.error('Unable to open Wasm directory.', '[Policy Manager]');
      return null;
    }
    const policyFiles = [];
    files.forEach((file) => {
      const fileContent = fs.readFileSync(`${process.env.WASM_DIR}/${file}`);
      const version = getVersion(file);
      policyFiles.push({ name: file, version, content: fileContent });
    });
    logger.success(`Number of policies: ${policyFiles.length}`, '[Policy Manager]');
    return policyFiles;
  },

  /**
   * Returns the policy relevant data including dpo data and database data.
   * @returns {Promise<{entities: *, consents: *, principals: *}>}
   */
  getPolicyData() {
    const privacyPolicy = fs.readFileSync(`${process.env.PRIVACY_POLICY_FILE}`);
    const policy = !privacyPolicy ? {} : JSON.parse(privacyPolicy.toString());
    // const principalInfo = dataHelper.getPrincipalInformation();
    // const entityInfo = dataHelper.getEntityInformation();
    // const consentInfo = dataHelper.getConsentInformation();
    // const policyData = Promise.all([principalInfo, entityInfo, consentInfo])
    //   .then(([principals, entities, consents]) => ({
    //     ...policy, principals, entities, consents,
    //   }));
    const dataFile = fs.readFileSync(`${process.env.DATA_FILE}`);
    const data = !dataFile ? {} : JSON.parse(dataFile.toString());
    const policyData = { ...policy, ...data }
    logger.success('Data fetched and merged.', '[Policy Manager]');
    return policyData;
  },

  getPolicy() {
    const privacyPolicy = fs.readFileSync(`${process.env.PRIVACY_POLICY_FILE}`);
    return !privacyPolicy ? {} : JSON.parse(privacyPolicy.toString());
  },

  updatePolicy(data) {
    updatePolicy(data);
    updateVersionControl('privacy_policy.json');
  },
};

/**
 * Responsible for building the rego policies stored in the REGO_DIR into wasm ones.
 * 1. Get all Rego policies stored in REGO_DIR directory.
 * For each policy:
 *    2. Check if it is already built. (optimization step)
 *    3. Generate the bundle (.tar.gz with .rego + .wasm + data).
 *    4. Extract .wasm
 */
function buildWasmPolicies() {
  if (!shell.which('opa')) {
    logger.error('Sorry, this operation requires the opa binary.', '[Policy Manager]');
    shell.exit(1);
    return;
  }

  /* 1. Get all Rego policies stored in REGO_DIR directory. */
  const policyFiles = fs.readdirSync(process.env.REGO_DIR);
  if (!policyFiles) {
    logger.error('Unable to open Rego directory.', '[Policy Manager]');
    return;
  }

  policyFiles.forEach((regoFilename) => {
    /* 2. Check if it is already built. (optimization step) */
    if (fs.existsSync(`${process.env.WASM_DIR}/${path.basename(regoFilename, path.extname(regoFilename))}.wasm`)) return;
    logger.info(`Build .wasm policy for file ${regoFilename}.`, '[Policy Manager]');

    /* 3. Generate the bundle (.tar.gz with .rego + .wasm + data). */
    const bundleFilename = helper.generateBundle(regoFilename);
    if (!bundleFilename) return;
    logger.success(`   1. Bundle ${bundleFilename}.`, '[Policy Manager]');

    /* 4. Extract .wasm */
    const wasmFile = helper.extractWasmFile(regoFilename, bundleFilename);
    if (!wasmFile) return;
    logger.success(`   2. Extract ${wasmFile}.`, '[Policy Manager]');
  });
}

function initData() {
  const principalInfo = dataHelper.getPrincipalInformation();
  const entityInfo = dataHelper.getEntityInformation();
  const consentInfo = dataHelper.getConsentInformation();
  Promise.all([principalInfo, entityInfo, consentInfo])
    .then(([principals, entities, consents]) => {
      const principalsDict = {};
      principals.forEach((principal) => { principalsDict[principal.principal] = principal; });
      const entitiesDict = {};
      entities.forEach((entity) => { entitiesDict[entity.entity] = entity; });
      const consentsDict = {};
      consents.forEach((consent) => { consentsDict[consent.dataSubject] = consent; });
      const data = JSON.stringify({ principals: principalsDict, entities: entitiesDict, consents: consentsDict });
      // const data = JSON.stringify({ principals, entities, consents });
      fs.writeFileSync(`${process.env.DATA_FILE}`, data);
      if (principalsDict && entitiesDict && consentsDict) {
      // if (principals && entities && consents) {
        logger.success(`Data initialized and wrote to file ${process.env.DATA_FILE}.`, '[Policy Manager]');
      }
    });
}

/**
 * Responsible for updating the dpo data file.
 * @param data
 * @returns {boolean}
 */
function updatePolicy(data) {
  if (!data) {
    logger.error('Unable to get data from file.', '[Policy Manager]');
    return false;
  }
  fs.writeFileSync(`${process.env.DATA_DPO_FILE}`, data);
  return true;
}

function updateVersionControl(name) {
  logger.info('Updating policy version control file.', '[Policy Manager]');
  if (!fs.existsSync('config/versions.json')) {
    logger.error('Policy version control file not found.', '[Policy Manager]');
  }
  const fileContent = fs.readFileSync('config/versions.json');
  const jsonContent = fileContent.length ? JSON.parse(fileContent.toString()) : {};
  const currentFileVersion = jsonContent[name];
  jsonContent[name] = !currentFileVersion ? 1 : currentFileVersion + 1;
  fs.writeFileSync('config/versions.json', JSON.stringify(jsonContent));
  logger.success(`Updated version control file for file ${name}: ${currentFileVersion} --> ${jsonContent[name]}`, '[Policy Manager]');
}

function getVersion(policyName) {
  logger.info(`Get policy version for file ${policyName}.`, '[Policy Manager]');
  if (!fs.existsSync('config/versions.json')) {
    logger.error('Policy version control file not found.', '[Policy Manager]');
  }
  const fileContent = fs.readFileSync('config/versions.json');
  const jsonContent = fileContent.length ? JSON.parse(fileContent.toString()) : {};
  const currentFileVersion = jsonContent[policyName];
  logger.success(`Current version for file ${policyName}: ${currentFileVersion}.`, '[Policy Manager]');
  return currentFileVersion || 0;
}
