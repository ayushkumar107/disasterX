"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startCronJobs = void 0;
var _nodeCron = _interopRequireDefault(require("node-cron"));
var _IngestionService = require("../services/IngestionService");
var _logger = require("../utils/logger");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const startCronJobs = () => {
  _logger.logger.info('🕒 Initializing background cron jobs...');

  // Run disaster data ingestion every 30 minutes
  _nodeCron.default.schedule('*/30 * * * *', async () => {
    _logger.logger.info('🕒 Triggering scheduled disaster ingestion...');
    await _IngestionService.ingestionService.runIngestion();
  });

  // Optional: Run other cleanup jobs at midnight, etc.
};
exports.startCronJobs = startCronJobs;