const mongoose = require('mongoose');

const principalSchema = new mongoose.Schema({
  principal: String,
  role: String,
  entity: String,
});

module.exports = mongoose.model('principals', principalSchema);
