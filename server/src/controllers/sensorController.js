"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllSensors = getAllSensors;
exports.getSensorReadings = getSensorReadings;

var _SoilMoistureService = require("../services/landslide/SoilMoistureService");
var _logger = require("../utils/logger");

async function getAllSensors(req, res) {
  try {
    const sensors = await _SoilMoistureService.soilMoistureService.getAllSensors();
    res.json({ success: true, data: sensors, count: sensors.length });
  } catch (error) {
    _logger.logger.error({ error }, 'Get sensors failed');
    res.status(500).json({ success: false, error: 'Failed to fetch sensors' });
  }
}

async function getSensorReadings(req, res) {
  try {
    const { hours = 72 } = req.query;
    const data = await _SoilMoistureService.soilMoistureService.getSensorReadings(req.params.sensorId, parseInt(hours));
    if (!data) return res.status(404).json({ success: false, error: 'Sensor not found' });
    res.json({ success: true, data });
  } catch (error) {
    _logger.logger.error({ error }, 'Get sensor readings failed');
    res.status(500).json({ success: false, error: 'Failed to fetch readings' });
  }
}
