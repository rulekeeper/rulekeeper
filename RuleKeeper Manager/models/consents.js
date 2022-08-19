const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  cookie: String,
  dataSubject: String,
  purposes: [String],
});

module.exports = mongoose.model('consents', consentSchema);
