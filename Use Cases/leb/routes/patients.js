const express = require('express');

const router = express.Router();

const patientsController = require('../controllers').patients;

/* Register */
router.post('/register', patientsController.registerPatient);

/* Sign-Up */
router.post('/signup', patientsController.signUpPatient);

/* Get all patient data. */
router.get('/available', patientsController.getAllPatientData);

/* Get patient data. */
router.get('/:patientId', patientsController.getPatientData);

/* Update patient data. */
router.post('/:patientId', patientsController.updatePatientData);

/* Get patient medical history. */
router.get('/:patientId/history', patientsController.getPatientHistory);

/* Get patient clinical analysis. */
router.get('/:patientId/history/:analysisId', patientsController.getPatientAnalysis);

module.exports = router;
