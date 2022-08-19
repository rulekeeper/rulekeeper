const { v4: uuidv4 } = require('uuid');
const express = require('express');
const path = require('path');
const qs = require('qs');
const { internalDataManagementController } = require('../api');

const router = express.Router();

router.post('/set-consent', (req, res) => {
  let cookie;
  const query = qs.parse(req.query, { ignoreQueryPrefix: true });
  /* If user already gave consent to other purposes, we need to add the new purpose */
  if (req.cookies && req.cookies.rulekeeper) {
    cookie = JSON.parse(Buffer.from(req.cookies.rulekeeper, 'base64').toString());
    /* Update cookie */
    cookie.purpose.push(query.purpose);
  } else {
    /* If user has no previous consent, generate new cookie */
    const uuid = uuidv4();
    const purpose = [query.purpose];
    cookie = { uuid, purpose };
  }
  /* Send cookie */
  const encodedCookie = Buffer.from(JSON.stringify(cookie)).toString('base64');
  res.cookie('rulekeeper', encodedCookie, {
    domain: 'localhost',
    maxAge: 24 * 60 * 60 * 60,
    secure: false,
  });
  /* Update consent */
  internalDataManagementController.addCookieConsent(cookie.uuid, cookie.purpose, req, res);
  res.sendStatus(200);
});

router.get('/banner', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

router.post('/banner', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/index.html'));
});

module.exports = router;
