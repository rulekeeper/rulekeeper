const express = require('express');
const router = express.Router();
const ticketController = require('../controllers').tickets;

router.get('/schedules', ticketController.seeSchedules)

router.post('/buy_ticket', ticketController.buyTicket)

router.get('/purchase_history', ticketController.seePurchaseHistory)

module.exports = router;
