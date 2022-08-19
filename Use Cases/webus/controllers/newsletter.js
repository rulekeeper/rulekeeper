const mongoose = require('mongoose');

const Newsletter = mongoose.model('newsletter');
const Ticket = mongoose.model('tickets');

module.exports = {

  subscribe(req, res) {
    const { e_mail } = req.body;

    if ( !e_mail) {
      res.status(400).json('Missing information'); return;
    }

    /* Add new e-mail to database */
    const subscription = {
      e_mail: e_mail,
    };

    Newsletter.create(subscription,  (err, subscribedEmail ) => {
      if (err) { res.status(400).json('Error subscribing to newsletter.'); return; }

      Ticket.find(  { $and: [ {e_mail: e_mail}, {date: {$gte: new Date(2020)} }] },
          (err, tickets) => {
        if (tickets.length >= 10) {
          console.log("Send Promo Code");
          res.status(200).json({ subscribedEmail, frequentTraveler: true});
        }
        else res.status(200).json({subscribedEmail, frequentTraveler: false});
      })
    });
  },

}
