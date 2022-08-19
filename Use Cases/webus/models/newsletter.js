const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  e_mail: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model('newsletter', newsletterSchema);
