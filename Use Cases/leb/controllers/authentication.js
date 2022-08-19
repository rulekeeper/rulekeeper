const mongoose = require('mongoose');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sessionManagement } = require('../../../RuleKeeper Middleware/api');

const User = mongoose.model('users');
require('dotenv').config({ path: '.env' });

function rejectAuthentication(res, message, code) {
  res.status(code);
  res.json(message);
}

function generateToken(username) {
  /* Create token for user with username and expiration timestamp */
  const payload = { id: username };
  const secret = process.env.TOKEN_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

async function basicAuthentication(req, res) {
  const credentials = auth(req);
  if (!credentials) return rejectAuthentication(res, 'Bad credentials.', 400);

  /* Check if user is registered */
  const user = await User.findOne({ username: credentials.name });
  if (!user) return rejectAuthentication(res, 'User not registered.', 400);
  const passwordMatch = await bcrypt.compare(credentials.pass, user.password);
  if (!passwordMatch) return rejectAuthentication(res, 'Incorrect password.', 401);

  /* Generate and send token */
  const token = generateToken(credentials.name);
  // For server-side testing purposes, remove interaction with the cookie banners
  const encodedCookie = Buffer.from(JSON.stringify({ purpose: ["clinical analysis", "marketing"] })).toString('base64');
  res.cookie('rulekeeper', encodedCookie, {
    domain: 'localhost',
    maxAge: 24 * 60 * 60 * 60,
    secure: false,
  });
  if (token) return res.status(200).json({ token });
  return res.status(400).json({ msg: 'Unable to generate token' });
}

function verifyAuth(req, res, next) {
  const auth = req.header('Authorization');
  if (!auth) {
    res.status(400).json('Missing Token');
    return;
  }
  const token = auth.split(' ')[1];
  const secret = process.env.TOKEN_SECRET;
  const decoded = jwt.verify(token, secret);
  if (decoded) {
    sessionManagement.initSession(res, decoded.id);
    next();
  } else res.status(401).json('Invalid Token');
}

module.exports = {
  authenticate(req, res) {
    basicAuthentication(req, res);
  },
  verifyAuthentication(req, res, next) {
    verifyAuth(req, res, next);
  },
};
