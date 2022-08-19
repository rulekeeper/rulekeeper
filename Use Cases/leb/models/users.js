const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  entity: {
    type: String,
    trim: true,
    default: null,
  },
});

module.exports = mongoose.model('users', userSchema);
