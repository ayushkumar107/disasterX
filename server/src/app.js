"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _helmet = _interopRequireDefault(require("helmet"));
var _cors = _interopRequireDefault(require("cors"));
var _pinoHttp = _interopRequireDefault(require("pino-http"));
var _path = _interopRequireDefault(require("path"));
var _env = require("./config/env");
var _logger = require("./utils/logger");
var _rateLimiter = require("./middleware/rateLimiter");
var _errorHandler = require("./middleware/errorHandler");
var _routes = _interopRequireDefault(require("./routes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = (0, _express.default)();

// Security
app.use((0, _helmet.default)());
app.use((0, _cors.default)({
  origin: _env.env.CLIENT_URL,
  credentials: true
}));

// Request logging
app.use((0, _pinoHttp.default)({
  logger: _logger.logger,
  autoLogging: _env.env.NODE_ENV !== 'test'
}));

// Body parsing
app.use(_express.default.json({
  limit: '10mb'
}));
app.use(_express.default.urlencoded({
  extended: true
}));

// Rate limiting
app.use('/api/', _rateLimiter.generalLimiter);

// Static files for uploads
app.use('/uploads', _express.default.static(_path.default.resolve(_env.env.UPLOAD_DIR)));

// API Routes
app.use('/api', _routes.default);

// 404 handler
app.use(_errorHandler.notFoundHandler);

// Error handler
app.use(_errorHandler.errorHandler);
var _default = exports.default = app;