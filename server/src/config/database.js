"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectDatabase = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
var _env = require("./env");
var _logger = require("../utils/logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const connectDatabase = async () => {
  try {
    await _mongoose.default.connect(_env.env.MONGODB_URI);
    _logger.logger.info('MongoDB connected successfully');
  } catch (error) {
    _logger.logger.error({
      error
    }, 'MongoDB connection failed');
    process.exit(1);
  }
  _mongoose.default.connection.on('error', err => {
    _logger.logger.error('MongoDB connection error:', err);
  });
  _mongoose.default.connection.on('disconnected', () => {
    _logger.logger.warn('MongoDB disconnected');
  });
};
exports.connectDatabase = connectDatabase;