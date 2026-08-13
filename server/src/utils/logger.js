"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = void 0;
var _pino = _interopRequireDefault(require("pino"));
var _env = require("../config/env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const logger = exports.logger = (0, _pino.default)({
  level: _env.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: _env.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});