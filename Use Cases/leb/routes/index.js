const express = require('express');
const authController = require('../controllers').authentication;

const router = express.Router();

router.post('/authenticate', authController.authenticate);

/* GET home page. */
router.get('/', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
