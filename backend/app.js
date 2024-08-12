const express = require('express');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const routes = require('./routes');
const sessionRouter = require('./routes/api/session');
const usersRouter = require('./routes/api/users');
const bookingRoutes = require('./routes/api/bookings');
const reviewsRoutes = require('./routes/api/reviews');
const spotRoutes = require('./routes/api/spots');
const spotImageRoutes = require('./routes/api/spotImages');
const reviewImageRoutes = require('./routes/api/reviewImages');
const { ValidationError } = require('sequelize');
require('dotenv').config();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();

// Security Middleware
if (!isProduction) {
  app.use(cors());
}
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // Logging middleware

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Use Routers
app.use('/api/session', sessionRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/spot-images', spotImageRoutes);
app.use('/api/review-images', reviewImageRoutes);

// Use CSRF Protection for all routes
app.use(csrfProtection);

// General Routes
app.use(routes);

// Catch unhandled requests and forward to error handler
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Handle Sequelize errors
app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.message = 'Validation error';
    err.errors = errors;
    err.status = 400; // Ensure the correct status code
  }
  next(err);
});


// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);

  const response = {
    message: err.message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }
  res.json(response);
});


module.exports = app;
