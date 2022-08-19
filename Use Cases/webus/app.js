const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser')
const rulekeeper = require('../../RuleKeeper Middleware');

const app = express();

rulekeeper.init(mongoose);
rulekeeper.addContext(app);

// import environmental variables
require('dotenv').config({ path: '.env' });

// set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Load mongoose models
require('./models/tickets')
require('./models/newsletter')
require('./models/schedules')

// Load routes
const indexRouter = require('./routes');
const ticketRouter = require('./routes/tickets');
const newsletterRouter = require('./routes/newsletter');

// connect to database
mongoose.connect(process.env.DATABASE, { useUnifiedTopology: true, useNewUrlParser: true });

mongoose.connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});
mongoose.connection.on('error', (err) => {
  console.log(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`, '[App]');
});

app.use('/', indexRouter);
app.use('/tickets', ticketRouter);
app.use('/newsletter', newsletterRouter);

module.exports = app;
