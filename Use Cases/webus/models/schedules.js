const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  travelers: {
    type: [String],
  }
});

module.exports = mongoose.model('schedules', scheduleSchema);
