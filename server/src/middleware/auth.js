"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.optionalAuth = exports.authenticate = void 0;
var _express = require("express");
var _jwt = require("../utils/jwt");
var _logger = require("../utils/logger");
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Authentication required'
    });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = (0, _jwt.verifyAccessToken)(token);
    req.user = payload;
    next();
  } catch (error) {
    _logger.logger.debug({
      error
    }, 'Token verification failed');
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = (0, _jwt.verifyAccessToken)(token);
    } catch {
      // Token invalid, continue without auth
    }
  }
  next();
};
exports.optionalAuth = optionalAuth;