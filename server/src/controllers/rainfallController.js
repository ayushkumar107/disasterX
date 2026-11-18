"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRainfallData = getRainfallData;
exports.getRainfallForZone = getRainfallForZone;
exports.getRainfallHistory = getRainfallHistory;

var _RainfallService = require("../services/landslide/RainfallService");
var _logger = require("../utils/logger");

async function getRainfallData(req, res) {
  try {
    const data = await _RainfallService.rainfallService.getAllLatest();
    res.json({ success: true, data });
  } catch (error) {
    _logger.logger.error({ error }, 'Get rainfall data failed');
    res.status(500).json({ success: false, error: 'Failed to fetch rainfall data' });
  }
}

async function getRainfallForZone(req, res) {
  try {
    const data = await _RainfallService.rainfallService.getLatestForZone(req.params.zoneId);
    res.json({ success: true, data });
  } catch (error) {
    _logger.logger.error({ error }, 'Get zone rainfall failed');
    res.status(500).json({ success: false, error: 'Failed to fetch rainfall for zone' });
  }
}

async function getRainfallHistory(req, res) {
  try {
    const { hours = 72 } = req.query;
    const data = await _RainfallService.rainfallService.getHistoryForZone(req.params.zoneId, parseInt(hours));
    res.json({ success: true, data });
  } catch (error) {
    _logger.logger.error({ error }, 'Get rainfall history failed');
    res.status(500).json({ success: false, error: 'Failed to fetch rainfall history' });
  }
}
