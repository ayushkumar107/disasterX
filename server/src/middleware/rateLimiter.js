"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadLimiter = exports.sosLimiter = exports.generalLimiter = exports.authLimiter = void 0;
var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const generalLimiter = exports.generalLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 200,
  message: {
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = exports.authLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
const uploadLimiter = exports.uploadLimiter = (0, _expressRateLimit.default)({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many uploads, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
const sosLimiter = exports.sosLimiter = (0, _expressRateLimit.default)({
  windowMs: 60 * 60 * 1000,
  // 1 hour
  max: 5,
  message: {
    error: 'SOS rate limit reached. If this is a genuine emergency, call local emergency services.'
  },
  standardHeaders: true,
  legacyHeaders: false
});