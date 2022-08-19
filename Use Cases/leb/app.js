const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const unless = require('express-unless');
const logger = require('./utils/logger');
const rulekeeper = require('../../RuleKeeper Middleware');

const app = express();
rulekeeper.measureRequestTime(app);
rulekeeper.init(mongoose);

require('./models/users');
require('./models/patients');
require('./models/entities');
require('./models/consentimento');

const indexRouter = require('./routes');
const patientRouter = require('./routes/patients');
const userRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging
//app.use(morgan('dev'));

// import environmental variables
require('dotenv').config({ path: '.env' });

// connect to data
mongoose.connect(process.env.DATABASE, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once('open', () => {
  logger.success('MongoDB data connection established successfully');
});
mongoose.connection.on('error', (err) => {
  logger.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`, '[App]');
});

// TODO - Error handling

const authService = require('./controllers/authentication');

authService.verifyAuthentication.unless = unless;
app.use(authService.verifyAuthentication.unless({ path: ['/', '/authenticate', '/register'] }));

rulekeeper.addContext(app);

app.use('/', indexRouter);
app.use('/patients', patientRouter);
app.use('/users', userRouter);

module.exports = app;
