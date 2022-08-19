var express = require('express');
var router = express.Router();
const usersController = require('../controllers').users;

/* GET - get all users */
router.get('/', usersController.getAllUsers);

/* POST - register user - username + password + role + (entity - optional). */
router.post('/register', usersController.registerUser);

/* DELETE - delete user */
router.delete('/:username', usersController.deleteUser);

/* POST - update all user roles . */
router.post('/all', usersController.changeAllSystemRole);

/* POST - update user role . */
router.post('/:username', usersController.changeSystemRole);



module.exports = router;
