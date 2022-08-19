const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const logger = require('./utils/logger');

require('./models/principals');
require('./models/entities');
require('./models/consents');

const indexRouter = require('./routes');
const cookieManagementRouter = require('./routes/cookie_management');

const app = express();

app.use(cors({ origin: 'https://localhost:3031' }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

// Logging
// noinspection JSCheckFunctionSignatures
app.use(morgan('dev'));

app.use(fileUpload());

// import environmental variables
require('dotenv').config({ path: '.env' });

// connect to database
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, retryWrites: false,
});
mongoose.set('useCreateIndex', true);

mongoose.connection.once('open', () => {
  logger.success('MongoDB database connection established successfully');
});
mongoose.connection.on('error', (err) => {
  logger.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`, '[App]');
});

// TODO - Error handling

app.use('/', indexRouter);
app.use('/consent', cookieManagementRouter);

module.exports = app;
