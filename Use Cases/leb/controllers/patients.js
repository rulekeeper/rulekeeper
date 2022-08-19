const mongoose = require('mongoose');
const flatten = require('flat');
const logger = require('../utils/logger');
const helper = require('../utils/helper');

const Patient = mongoose.model('patients');
const User = mongoose.model('users');
const Entity = mongoose.model('entities');
const Consent = mongoose.model('consentimentos');

const rulekeeper = require('../../../RuleKeeper Middleware/api');

module.exports = {

  registerPatient(req, res) {
    const data = req.body;

    /* Validate received personal_data */
    const { citizencard, personal_data } = data;
    const { full_name } = personal_data;
    if (!citizencard || !full_name) {
      logger.error('Missing information.', ['Patient Controller']);
      res.status(400).json('Missing information');
      return;
    }

    /* Add new user to data */
    const user = {
      username: citizencard,
      password: helper.generateRandomPassword(),
      role: 'utente',
      entity: full_name,
    };
    const userPromise = User.create(user, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error registering user.');
      }
    });

    /* Add new patient to data */
    const patient = helper.createPatient(data);
    const patientPromise = Patient.create(patient, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error registering patient.');
      }
    });

    Promise.all([userPromise, patientPromise]).then((values) => {
      if (res.finished) return;
      rulekeeper.userManagement.addPrincipal({ principal: citizencard, role: 'patient', entity: `${citizencard}` });
      res.status(200).json(patient);
    });
  },

  signUpPatient(req, res) {

  },

  getPatientData(req, res) {
    const { patientId } = req.params;
    logger.info(`Received getPatientData request with id: ${patientId}.`, '[Patient Controller]');

    // if it does not contain information about the columns to return, returns all
    Patient.findOne({ citizencard: patientId }, (err, user) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error fetching patient data.');
        return;
      }
      res.status(200).json(user);
    });
  },

  getAllPatientData(req, res) {
    logger.info('Received getAllPatientData request.', '[Patient Controller]');

    Patient.find({}, (err, users) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error fetching patient data.');
        return;
      }
      res.status(200).json(users);
    });
  },

  updatePatientData(req, res) {
    const { patientId } = req.params;
    let data = req.body; // data contains the colums to return
    logger.info(`Received update PatientData request with id: ${patientId} and data ${JSON.stringify(data)}.`, '[Patient Controller]');

    if (data) data = flatten(data);
    Patient.findOneAndUpdate({ citizencard: patientId }, data, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error updating patient data.');
      } else res.sendStatus(200);
    });
  },

  getPatientHistory(req, res) {
    const { patientId } = req.params;
    logger.info(`Received getPatientHistory request with id: ${patientId}.`, '[Patient Controller]');

    res.sendStatus(200);
    // .catch((error) => res.status(400).send(error));
  },

  getPatientAnalysis(req, res) {
    const { patientId, analysisId } = req.params;
    logger.info(`Received getPatientAnalysis request with id: ${patientId} and analysis: ${analysisId}.`, '[Patient Controller]');

    res.sendStatus(200);
    // .catch((error) => res.status(400).send(error));
  },

};
