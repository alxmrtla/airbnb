//backend/app.js
const express = require('express');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const routes = require('./routes');
const sessionRouter = require('./routes/api/session');
const app = express();
const usersRouter = require('./routes/api/users');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { environment } = require('./config');
const isProduction = environment === 'production';
const csrfProtection = csrf({ cookie: true });
const { ValidationError } = require('sequelize');
const apiRouter = require('./routes/api');

// Middleware setup
app.use(express.json()); // Built-in middleware to parse JSON bodies
app.use(cookieParser());
app.use(morgan("dev")); // Logging middleware
app.use('/api/session', sessionRouter);
app.use('/api/users', usersRouter);

// Security middleware setup
app.use(csrfProtection);
app.use(routes);
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
  });

// Handle sequelize errors
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
      let errors = {};
      for (let error of err.errors) {
        errors[error.path] = error.message;
      }
      err.title = 'Validation error';
      err.errors = errors;
    }
    next(err);
  });

// Error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
      title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      stack: isProduction ? null : err.stack
    });
  });

  app.use('/api', apiRouter);



module.exports = app;
