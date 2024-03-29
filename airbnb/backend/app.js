//backend/app.js
const express = require('express');
require('express-async-errors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const routes = require('./routes');
const app = express();

require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { environment } = require('./config');
const isProduction = environment === 'production';
const csrfProtection = csrf({ cookie: true });

// Middleware setup
app.use(express.json()); // Built-in middleware to parse JSON bodies
app.use(cookieParser());
app.use(morgan("dev")); // Logging middleware

// Security middleware setup
app.use(csrfProtection);
app.use(routes);





module.exports = app;
