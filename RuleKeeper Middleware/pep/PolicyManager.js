const fs = require('fs');
const utf8 = require('utf8');
const path = require('path')
const { loadPolicy } = require('@open-policy-agent/opa-wasm');
const logger = require('../utils/logger');
const DataHelper = require('./DataHelper');
const { getVersion, updateVersion } = require('../config/version_utils');

const policies = {
  access_control: null,
  data_transfer: null,
  data: null
};

module.exports = {
  /**
   * Initializes the Policy Manager component.
   * If there are already WebAssembly files in the file system, loads them.
   * If any of them already exists, sets the data.
   */
  init() {
    loadPolicies().then(([accessControlPolicy, dataTransferPolicy]) => {
      if (accessControlPolicy) {
        policies.access_control = accessControlPolicy;
        logger.success('Access control policy loaded.', '[Policy Manager]');
      } else logger.error('Access control policy not loaded.', '[Policy Manager]');
      if (dataTransferPolicy) {
        policies.data_transfer = dataTransferPolicy;
        logger.success('Data transfer policy loaded.', '[Policy Manager]');
      } else logger.error('Data transfer policy not loaded.', '[Policy Manager]');
      loadData();
    });
  },

  /**
   * Update a policy specification. Called when middleware receives an update from the RuleKeeper Manager.
   * @param name of the policy file (.wasm)
   * @param version
   * @param content
   */
  updatePolicy(name, version, content) {
    let updated = false;
    /* Update policy if it is outdated */
    const currentVersion = getVersion(name)
    if (currentVersion <= version) {
      /* Write policy in the file system */
      fs.writeFileSync(path.join(__dirname,`/policies/${name}`), content);
      /* Check if policy was written in the correct file */
      if (!fs.existsSync(path.join(__dirname,`policies/${name}`))) {
        logger.error(`Unable to write policy ${name}`, '[Policy Manager]'); return;
      }
      /* Update version */
      updateVersion(name, version)
      updated = true;
    }

    /* Update runtime policies */
    if (name === 'rulekeeper.wasm') {
      loadPolicy(content).then((policy) => {
        policies.data_transfer = policy;
        logger.success(`Wrote policy ${name}`, '[Policy Manager]');
        setDataTransferPolicyData();
      });
    } else if (name === 'access_control.wasm') {
      loadPolicy(content).then((policy) => {
        policies.access_control = policy;
        logger.success(`Wrote policy ${name}`, '[Policy Manager]');
        setAccessControlPolicyData();
      });
    }
    return updated;
  },

  updatePolicyData(content) {
    console.log(path.join(__dirname, 'data.json'))
    fs.writeFile(path.join(__dirname, 'data.json'), content, (err) => {
        if (!err) {
          logger.success('Wrote policy data.', '[Policy Manager]');
          loadData();
        } else logger.error('Unable to write policy.', '[Policy Manager]');
    });
  },

  updateData(data, type) {
    fs.readFile(path.join(__dirname, 'data.json'), (err, fileContent) => {
      if (err) logger.error('Unable to read policy file.', '[Policy Manager]');
      else {
        const dataContent = JSON.parse(fileContent);
        const newData = JSON.parse(data);
        if (type === 'principals') { dataContent.principals = newData }
        else if (type === 'entities') { dataContent.entities = newData }
        else if (type === 'consent') { dataContent.consents = newData }
        else if (type === 'all') {
          dataContent.principals = newData.principals;
          dataContent.entities = newData.entities;
          dataContent.consents = newData.consents;
        }
        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(dataContent), (err) => {
          if (!err) {
            logger.success('Wrote policy data.', '[Policy Manager]');
            loadData();
          }
        });
      }
    });
  },

  newLocalAnonymousEntity(principal, entity, consent) {
    policies.data.principals.push({ principal, entity })
    policies.data.entities.push({ entity, roles: ['Data Subject'] })
    policies.data.consents.push({ cookie: principal, dataSubject: entity, purposes: consent })
    setAccessControlPolicyData();
    setDataTransferPolicyData();
  },

  getPrincipalContext(principalId) {
    return DataHelper.getPrincipalContext(principalId, policies.data);
  },

  getOperationPurpose(operation) {
    return DataHelper.getOperationPurpose(operation, policies.data)
  },

  getPurposeData(purpose) {
    return DataHelper.getPurposeData(purpose, policies.data)
  },

  checkPersonalData(query) {
    if (query == null) return null;
    // Get table name info
    let collectionName = query.mongooseCollection ? query.mongooseCollection.name : null;
    if (!collectionName) {
      const { collection } = Object.getPrototypeOf(query);
      collectionName = collection ? collection.name : null;
    }
    if (!collectionName) return null;
    // See if contains personal data
    const personalDataTables = policies.data.personal_data_tables;
    return personalDataTables.find((table) => table.table === collectionName);
  },

  evaluateAccessControl(principalId, operation) {
    logger.info(`Evaluating Access Control Policy with input ${principalId}, ${operation}...`, '[Policy Manager]');
    const evaluation = policies.access_control
      .evaluate({ principal: principalId, operation });
    const { result } = evaluation[0];
    if (result) {
      logger.success('Access Control Policy evaluated true ✓', '[Policy Manager]');
      return true;
    }
    logger.error('Access Control Policy evaluated false ✗', '[Policy Manager]');
    return false;
  },

  evaluateDataTransferControl(principalId, operation, data, table, subjects) {
    logger.info(`Evaluating Data Transfer Control Policy with input
        ${principalId}, ${operation}, ${table}: ${data.length}, ${subjects? subjects.length : 0}...`, '[Policy Manager]');// ${principalId}, ${operation}, ${table}: ${JSON.stringify(data)}, ${JSON.stringify(subjects)}...`, '[Policy Manager]');
    let evaluation;
    if (subjects) {
      evaluation = policies.data_transfer
        .evaluate({
          principal: principalId, operation, data, table, subjects: { key: subjects.key, list: subjects.list },
        });
    } else {
      evaluation = policies.data_transfer
        .evaluate({ principal: principalId, operation, data, table });
    }
    const { result } = evaluation[0];
    if (result) {
      logger.success('Data Transfer Policy evaluated true ✓', '[Policy Manager]');
      return true;
    }
    logger.error('Data Transfer Policy evaluated false ✗', '[Policy Manager]');
    return false;
  },

};

/**
 * Loads initial policy data - used in the policy enforcement systems,
 * if there is already data in the file system.
 */
function loadData() {
  /* Check if data file exists */
  if (!fs.existsSync(path.join(__dirname, 'data.json'))) {
    logger.error('Data file not found.', '[Policy Manager]');
    logger.error(fs.readdirSync('.'))
    return;
  }

  const fileContent = fs.readFileSync(path.join(__dirname,'data.json'));
  const encodedFileContent = utf8.encode(fileContent.toString());
  if (encodedFileContent.length > 0) policies.data = JSON.parse(encodedFileContent);

  if (!policies.data) {
    logger.error('Error loading data.', '[Policy Manager]');
    return;
  }
  logger.success('Data loaded.', '[Policy Manager]');
  setAccessControlPolicyData();
  setDataTransferPolicyData();
}

/**
 * Loads WebAssembly policies if they already exist in the file system.
 * @returns {Promise<|null|*[]>}
 */
async function loadPolicies() {
  let accessControlPolicy;
  let dataTransferPolicy;

  /* Opening the WebAssembly policy directory */
  const files = fs.readdirSync(path.join(__dirname, '/policies'));
  if (!files) {
    logger.error('Unable to open Wasm policies directory.', '[Policy Manager]');
    return [];
  }

  /* Load access control policy */
  if (fs.existsSync(path.join(__dirname,'policies/access_control.wasm'))) {
    const wasmPolicy = fs.readFileSync(path.join(__dirname,'policies/access_control.wasm'));
    accessControlPolicy = loadPolicy(wasmPolicy);
  } else logger.error('File policies/access_control.wasm not found', '[Policy Manager]');

  /* Load Data Transfer Control policy */
  if (fs.existsSync(path.join(__dirname,'policies/rulekeeper.wasm'))) {
    const wasmPolicy = fs.readFileSync(path.join(__dirname,'policies/rulekeeper.wasm'));
    dataTransferPolicy = loadPolicy(wasmPolicy);
  } else logger.error('File policies/rulekeeper.wasm not found', '[Policy Manager]');

  return Promise.all([accessControlPolicy, dataTransferPolicy]);
}

/**
 * Sets the policy data that will be use as data for the policy enforcement systems.
 */
function setAccessControlPolicyData() {
  if (!policies.data) {
    logger.error('Error loading data.', '[Policy Manager]');
    return;
  }
    policies.access_control.setData(policies.data);
    logger.success('Set the policy data to the access control policy.', '[Policy Manager]');
}

function setDataTransferPolicyData() {
  if (!policies.data) {
    logger.error('Error loading data.', '[Policy Manager]');
    return;
  }
    policies.data_transfer.setData(policies.data);
    logger.success('Set the policy data to the data transfer policy.', '[Policy Manager]');
}

