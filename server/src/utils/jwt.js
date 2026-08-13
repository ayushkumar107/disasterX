"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _env = require("../config/env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const generateAccessToken = payload => {
  return _jsonwebtoken.default.sign(payload, _env.env.JWT_SECRET, {
    expiresIn: _env.env.JWT_EXPIRES_IN
  });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = payload => {
  return _jsonwebtoken.default.sign(payload, _env.env.JWT_REFRESH_SECRET, {
    expiresIn: _env.env.JWT_REFRESH_EXPIRES_IN
  });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = token => {
  return _jsonwebtoken.default.verify(token, _env.env.JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = token => {
  return _jsonwebtoken.default.verify(token, _env.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;