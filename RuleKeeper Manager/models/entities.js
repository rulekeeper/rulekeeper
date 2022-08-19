const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
  entity: String,
  role: [String],
});

module.exports = mongoose.model('entities', entitySchema);
