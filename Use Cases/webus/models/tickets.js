const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  e_mail: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  credit_card: {
    type: Number
  },
});

module.exports = mongoose.model('tickets', ticketSchema);
