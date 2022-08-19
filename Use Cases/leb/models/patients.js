const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  citizencard: { type: String, required: true, trim: true, unique: true },
  patient_id: { type: Number, default: 0, required: true, trim: true },
  authenticated: { type: Boolean, required: true, trim: true },
  personal_data: {
    full_name: { type: String, trim: true },
    birth_date: { type: Date, trim: true },
    gender: { type: String, trim: true },
    ss_number: { type: String, trim: true },
    photo: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  contact_info: {
    mobile: { type: Number, trim: true },
    e_mail: { type: String, trim: true },
  },
});

module.exports = mongoose.model('patients', patientSchema);
