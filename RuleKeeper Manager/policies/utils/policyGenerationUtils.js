const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

module.exports = {
  /**
   * Responsible for generating the wasm bundle from the rego policy file.
   * @param regoFile
   * @returns {string|null} - bundle file name
   */
  generateBundle(regoFile) {
    const filename = `${process.env.REGO_DIR}/${regoFile}`;
    const bundleFilename = `${process.env.WASM_DIR}/${path.basename(regoFile, path.extname(regoFile))}.tar.gz`;
    shell.exec(`opa build -o=2 -t wasm -e 'rulekeeper/allow' ${filename} ${process.env.REGO_RULES_DIR} ${process.env.REGO_UTILS_DIR} -o ${bundleFilename}`);

    if (!fs.existsSync(bundleFilename)) {
      logger.error(`Unable to generate bundle ${bundleFilename}`, '[Policy Manager]');
      return null;
    }
    return bundleFilename;
  },

  /**
   * Responsible to extract the wasm file from the generated bundle.
   * Involves changing the name to match the .rego file.
   * @param file
   * @param bundle
   * @returns {string}
   */
  extractWasmFile(file, bundle) {
    if (!fs.existsSync(bundle)) {
      logger.error(`Unable to open generated bundle ${bundle}`, '[Policy Manager]');
      return null;
    }
    /* Extract the policy from the bundle */
    shell.exec(`tar -C ${process.env.WASM_DIR} -xzf ${bundle} /policy.wasm`, { silent: true });
    const filename = `${process.env.WASM_DIR}/policy.wasm`;
    if (!shell.find(filename)) {
      logger.error(`Unable to generate .wasm file from ${file}`, '[Policy Manager]');
      return null;
    }
    /* Change the name */
    const newFilename = `${process.env.WASM_DIR}/${path.basename(file, path.extname(file))}.wasm`;
    fs.renameSync(filename, newFilename);
    /* Remove bundle from file system. */
    fs.unlinkSync(bundle);
    return filename;
  },
};
