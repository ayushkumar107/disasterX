"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _authRoutes = _interopRequireDefault(require("./authRoutes"));
var _disasterRoutes = _interopRequireDefault(require("./disasterRoutes"));
var _shelterRoutes = _interopRequireDefault(require("./shelterRoutes"));
var _sosRoutes = _interopRequireDefault(require("./sosRoutes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = (0, _express.Router)();
router.use('/auth', _authRoutes.default);
router.use('/disasters', _disasterRoutes.default);
router.use('/shelters', _shelterRoutes.default);
router.use('/sos', _sosRoutes.default);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
var _default = exports.default = router;