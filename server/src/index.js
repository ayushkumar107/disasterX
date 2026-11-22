"use strict";

var _http = _interopRequireDefault(require("http"));
var _app = _interopRequireDefault(require("./app"));
var _env = require("./config/env");
var _database = require("./config/database");
var _logger = require("./utils/logger");
var _seed = require("./seeds/seed");
var _cron = require("./config/cron");
var _IngestionService = require("./services/IngestionService");
var _socketio = require("./config/socketio");
var _seedNER = require("./seeds/seedNER");
var _chatController = require("./controllers/chatController");
var _Shelter = require("./models/Shelter");
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }

const startServer = async () => {
  // Ensure upload directory exists
  const uploadDir = _path.default.resolve(_env.env.UPLOAD_DIR);
  if (!_fs.default.existsSync(uploadDir)) {
    _fs.default.mkdirSync(uploadDir, {
      recursive: true
    });
    _logger.logger.info(`Created upload directory: ${uploadDir}`);
  }

  // Connect to MongoDB
  await (0, _database.connectDatabase)();

  // Initialize background jobs
  (0, _cron.startCronJobs)();

  // Seed default community chat rooms
  await (0, _chatController.seedDefaultRooms)();

  // Seed database and run initial ingestion (runs in dev or on fresh cloud databases)
  const existingShelters = await _Shelter.Shelter.countDocuments();
  if (_env.env.NODE_ENV === 'development' || existingShelters === 0) {
    _logger.logger.info('Initializing default seeds & shelters (fresh DB detected or dev mode)...');
    await (0, _seed.seedDatabase)();
    await (0, _seedNER.seedNERData)();
    if (_env.env.NODE_ENV === 'development') {
      _IngestionService.ingestionService.runIngestion().catch(e => _logger.logger.error('Initial ingestion failed', e));
    }
  }

  // Create HTTP server
  const server = _http.default.createServer(_app.default);

  // Wire up Socket.IO for real-time NER monitoring & Chat
  (0, _socketio.setupSocketIO)(server, _env.env.CLIENT_URL);

  server.listen(_env.env.PORT, '0.0.0.0', () => {
    _logger.logger.info(`🚀 DISASTERLINK NER — Landslide Intelligence Platform`);
    _logger.logger.info(`🏔️ Server running on port ${_env.env.PORT} (0.0.0.0)`);
    _logger.logger.info(`📡 Environment: ${_env.env.NODE_ENV}`);
    _logger.logger.info(`🔗 Client URL: ${_env.env.CLIENT_URL}`);
    _logger.logger.info(`🔌 Socket.IO: Active`);
  });

  // Graceful shutdown
  const shutdown = async signal => {
    _logger.logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      _logger.logger.info('Server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
startServer().catch(err => {
  _logger.logger.error('Failed to start server:', err);
  process.exit(1);
});
