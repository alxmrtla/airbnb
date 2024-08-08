const { validationResult } = require('express-validator');

// Middleware for formatting errors from express-validator middleware
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach(error => {
      errors[error.param] = error.msg;
    });

    const err = new Error("Bad Request");
    err.errors = errors;
    err.status = 400;
    next(err);
  } else {
    next();
  }
};

module.exports = {
  handleValidationErrors
};
