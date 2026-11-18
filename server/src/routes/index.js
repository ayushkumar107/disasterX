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
var _landslideRoutes = _interopRequireDefault(require("./landslideRoutes"));
var _rainfallRoutes = _interopRequireDefault(require("./rainfallRoutes"));
var _sensorRoutes = _interopRequireDefault(require("./sensorRoutes"));
var _warningRoutes = _interopRequireDefault(require("./warningRoutes"));
var _newsRoutes = _interopRequireDefault(require("./newsRoutes"));
var _chatRoutes = _interopRequireDefault(require("./chatRoutes"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const router = (0, _express.Router)();
router.use('/auth', _authRoutes.default);
router.use('/disasters', _disasterRoutes.default);
router.use('/shelters', _shelterRoutes.default);
router.use('/sos', _sosRoutes.default);

// NER Landslide Intelligence routes
router.use('/landslide', _landslideRoutes.default);
router.use('/rainfall', _rainfallRoutes.default);
router.use('/sensors', _sensorRoutes.default);
router.use('/warnings', _warningRoutes.default);

// News & Intelligence feed
router.use('/news', _newsRoutes.default);

// Real-Time Community & Rescue Chat
router.use('/chat', _chatRoutes.default);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'DISASTERLINK NER',
    version: '2.0.0',
    focus: 'Landslide Intelligence — North Eastern Region',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
var _default = exports.default = router;
