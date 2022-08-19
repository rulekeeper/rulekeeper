const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const logger = require('./logger');

module.exports = {
  generateRandomPassword() {
    const randomPassword = uuid.v4();
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(randomPassword, salt);
  },

  handleError(message) {
    if (message) {
      logger.error(`${message}`, '[User Controller]');
      return true;
    }
    return false;
  },

  createPatient(data) {
    // eslint-disable-next-line camelcase
    const { personal_data, contact_info } = data;
    return {
      citizencard: data.citizencard,
      // missing --> patient_id: max ++;
      authenticated: true,
      personal_data: {
        full_name: personal_data.full_name,
        birth_date: personal_data.birth_date,
        gender: personal_data.gender,
        ss_number: personal_data.ss_number,
        photo: personal_data.photo,
        address: personal_data.address,
      },
      contact_info: {
        mobile: contact_info.mobile,
        e_mail: contact_info.e_mail,
      },
    };
  },
};
