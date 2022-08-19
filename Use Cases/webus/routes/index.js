const express = require('express');
const { hasCookie, sendCookie } = require('../utils/manage_cookies');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.status(200);
  res.render('index')
});

module.exports = router;
