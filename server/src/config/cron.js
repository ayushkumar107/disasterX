"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startCronJobs = void 0;
var _nodeCron = _interopRequireDefault(require("node-cron"));
var _IngestionService = require("../services/IngestionService");
var _RainfallService = require("../services/landslide/RainfallService");
var _SoilMoistureService = require("../services/landslide/SoilMoistureService");
var _RiskEngine = require("../services/landslide/RiskEngine");
var _EarlyWarningService = require("../services/landslide/EarlyWarningService");
var _LandslideRiskZone = require("../models/LandslideRiskZone");
var _logger = require("../utils/logger");
var _MockRainfallAdapter = require("../services/adapters/MockRainfallAdapter");
var _OpenMeteoRainfallAdapter = require("../services/adapters/OpenMeteoRainfallAdapter");
var _MockSensorAdapter = require("../services/adapters/MockSensorAdapter");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const startCronJobs = () => {
  _logger.logger.info('🕒 Initializing background cron jobs...');

  // Setup service adapters on startup
  const isMock = process.env.USE_MOCK_DATA !== 'false';
  _logger.logger.info(`📡 Landslide adapters mode: ${isMock ? 'SIMULATED' : 'LIVE'}`);
  
  if (isMock) {
    _RainfallService.rainfallService.setAdapter(new _MockRainfallAdapter.MockRainfallAdapter());
    _SoilMoistureService.soilMoistureService.setAdapter(new _MockSensorAdapter.MockSensorAdapter());
  } else {
    _RainfallService.rainfallService.setAdapter(new _OpenMeteoRainfallAdapter.OpenMeteoRainfallAdapter());
    _SoilMoistureService.soilMoistureService.setAdapter(new _MockSensorAdapter.MockSensorAdapter()); // default mock iot
  }

  // Run disaster data ingestion every 30 minutes
  _nodeCron.default.schedule('*/30 * * * *', async () => {
    _logger.logger.info('🕒 Triggering scheduled disaster ingestion...');
    await _IngestionService.ingestionService.runIngestion();
  });

  // Run soil moisture sensor data aggregation every 5 minutes
  _nodeCron.default.schedule('*/5 * * * *', async () => {
    _logger.logger.info('🕒 Collecting soil moisture telemetry...');
    await _SoilMoistureService.soilMoistureService.collectReadings();
  });

  // Run rainfall telemetry update every 10 minutes
  _nodeCron.default.schedule('*/10 * * * *', async () => {
    _logger.logger.info('🕒 Updating rainfall readings...');
    const zones = await _LandslideRiskZone.LandslideRiskZone.find({ status: { $in: ['ACTIVE', 'MONITORING'] } });
    await _RainfallService.rainfallService.updateRainfallData(zones);
  });

  // Run landslide risk calculations and early warning assessment every 15 minutes
  _nodeCron.default.schedule('*/15 * * * *', async () => {
    _logger.logger.info('🕒 Assessing landslide risk levels...');
    await _RiskEngine.riskEngine.evaluateAllZones(_RainfallService.rainfallService, _SoilMoistureService.soilMoistureService, null);
    await _EarlyWarningService.earlyWarningService.evaluateWarnings();
  });
};
exports.startCronJobs = startCronJobs;