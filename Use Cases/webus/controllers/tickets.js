const mongoose = require('mongoose');

const Schedule = mongoose.model('schedules');
const Ticket = mongoose.model('tickets');

module.exports = {

  seeSchedules(req, res) {
    // Return all schedules from all time
    Schedule.find({}, (err, schedules) => {
      if (err) { res.status(400).json('Error fetching schedules.'); return; }
      res.status(200).json(schedules);
    });
  },

  buyTicket(req, res) {
    const { name, e_mail, credit_card, destination, schedule } = req.body;


    if (!name || !e_mail || !credit_card || !destination || !schedule) {
      res.status(400).json('Missing information'); return;
    }

    /* Add new ticket to database */
    const ticket = {
      name: name,
      e_mail: e_mail,
      destination: destination,
      date: Date.parse(schedule),
      credit_card: credit_card,
    };

    Ticket.create(ticket,  (err, createdTicket ) => {
      if (err) { res.status(400).json('Error buying ticket.'); return; }

      /* Add new traveler to trip */
      Schedule.findOneAndUpdate({ destination: destination, date: schedule }, { $push: { travelers: name }}, {},
          (err, updatedSchedule) => {
              if (err) { res.status(400).json('Error adding traveler.'); return; }
              res.status(200).json({createdTicket, updatedSchedule });
          });
    });
  },

  seePurchaseHistory(req, res) {
    const { name } = req.query;

    Ticket.find( {$where: "this.name === '" + name + "'"} , 'name destination date -_id', (err, tickets) => {
      if (err) { res.status(400).json('Error fetching ticket history.'); return; }
      res.status(200).json(tickets);
    })
  },
}
