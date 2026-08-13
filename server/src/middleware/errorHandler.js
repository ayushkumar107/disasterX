"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notFoundHandler = exports.errorHandler = exports.createError = void 0;
var _logger = require("../utils/logger");
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error
  if (statusCode >= 500) {
    _logger.logger.error({
      err,
      method: req.method,
      url: req.url,
      statusCode
    }, 'Server error');
  } else {
    _logger.logger.warn({
      message: err.message,
      method: req.method,
      url: req.url,
      statusCode
    }, 'Client error');
  }

  // Don't expose internal errors in production
  const message = statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
exports.createError = createError;
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`
  });
};
exports.notFoundHandler = notFoundHandler;