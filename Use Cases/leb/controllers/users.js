const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const logger = require('../utils/logger');
const helper = require('../utils/helper');

const User = mongoose.model('users');

module.exports = {

  async registerUser(req, res) {
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
  },

  deleteUser(req, res) {
    const { username } = req.params;
    logger.info(`Received registerUser request with username: ${username}`, '[User Controller]');
    User.deleteOne({ username }, (err) => {
      const errorCode = helper.handleError(err);
      res.sendStatus(errorCode);
    });
  },

  changeSystemRole(req, res) {
    const { username } = req.params;
    const { role } = req.body;
    logger.info(`Received update user role request with username: ${username} and new role: ${role}`, '[User Controller]');
    User.findOneAndUpdate({ username }, { role }, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error updating patient data.');
      } else res.sendStatus(200);
    });
  },

  changeAllSystemRole(req, res) {
    const { role } = req.body;
    logger.info(`Received update user role request with new role: ${role}`, '[User Controller]');
    User.updateMany({ username: /1234*/ }, { role }, (err) => {
      const error = helper.handleError(err);
      if (error) {
        res.status(400).json('Error updating patient data.');
      } else res.sendStatus(200);
    });
  },

  getAllUsers(req, res) {
    logRequest('getAllUsers', []);
    User.find({}, 'username password', (err, users) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else if (users && users.length > 0) res.status(200).json(users);
      else res.sendStatus(404);
    });
  },
};

function logRequest(requestName, params) {
  console.log(`[USERS] Received _${requestName}_ request with params: ${params.join(', ')}`);
}
