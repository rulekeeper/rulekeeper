const express = require('express');
const mongoose = require('mongoose');

require('./models/users');
require('./models/patients');

const User = mongoose.model('users');
const Patient = mongoose.model('patients');

const app = express();
const router = express.Router();

/* GET - get all users */
router.get('/', function(req, res) {
logRequest('getAllUsers', []);
    User.find({}, 'username password', (err, users) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else if (users && users.length > 0) res.status(200).json(users);
      else res.sendStatus(404);
    });
});

/* POST - register user - username + password + role + (entity - optional). */
router.post('/register',  function(req, res) {
const {
      username, password, role, entity,
    } = req.body;
    logger.info(`Received registerUser request with username: ${username}, password: ${password}, role: ${role}, entity: ${entity}`, '[User Controller]');

    /* Process user parameters */
    let newEntity = entity;
    if (!newEntity) {
      switch (role) {
        case 'utente':
          helper.handleError('Cannot register a patient via this operation.');
          res.status(400).json('Cannot register a patient via this operation.');
          return;
        case 'recepcionista':
        case 'técnica_análises':
        case 'diretor_técnico':
          newEntity = 'Laboratório LEB';
          break;
        default:
          break;
      }
    }

    if (!password || !username) {
      res.status(400).json('Missing username or password.');
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    User.create({
      username, password: hashedPassword, role, entity: newEntity,
    }, (err) => {
      const error = helper.handleError(err);
      return error ? res.status(400).json('Error registering User.') : res.sendStatus(200);
    });

});

/* DELETE - delete user */
router.delete('/:username',  function(req, res) {
const { username } = req.params;
    logger.info(`Received registerUser request with username: ${username}`, '[User Controller]');
    User.deleteOne({ username }, (err) => {
      const errorCode = helper.handleError(err);
      res.sendStatus(errorCode);
    });
});

/* POST - update all user roles . */
router.post('/all',  function(req, res) {
const { role } = req.body;
    logger.info(`Received update user role request with new role: ${role}`, '[User Controller]');
    User.updateMany({ username: /1234*/ }, { role }, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error updating patient data.');
      } else res.sendStatus(200);
    });
});

/* POST - update user role . */
router.post('/:username',  function(req, res) {
const { username } = req.params;
    const { role } = req.body;
    logger.info(`Received update user role request with username: ${username} and new role: ${role}`, '[User Controller]');
    User.findOneAndUpdate({ username }, { role }, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error updating patient data.');
      } else res.sendStatus(200);
    });
});

router.post('/register',  function(req, res) {
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
});

/* Get all patient data. */
router.get('/available',  function(req, res) {
logger.info('Received getAllPatientData request.', '[Patient Controller]');

    Patient.find({}, (err, users) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error fetching patient data.');
        return;
      }
      res.status(200).json(users);
    });
});

/* Get patient data. */
router.get('/:patientId',  function(req, res) {
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
    });});

/* Update patient data. */
router.post('/:patientId',  function(req, res) {
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
});
