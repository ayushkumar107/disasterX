"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.soilMoistureService = exports.SoilMoistureService = void 0;
var _SoilMoistureSensor = require("../../models/SoilMoistureSensor");
var _SoilMoistureReading = require("../../models/SoilMoistureReading");
var _logger = require("../../utils/logger");

class SoilMoistureService {
  constructor() {
    this.adapter = null;
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  /**
   * Collect readings from all active sensors
   */
  async collectReadings() {
    const sensors = await _SoilMoistureSensor.SoilMoistureSensor.find({
      status: 'ACTIVE'
    });

    _logger.logger.info(`📡 Collecting soil moisture from ${sensors.length} sensors...`);
    let collected = 0;

    for (const sensor of sensors) {
      try {
        let reading;
        
        if (this.adapter) {
          reading = await this.adapter.getReading(sensor.sensorId);
        } else {
          // Use simulated data
          reading = this._simulateReading(sensor);
        }

        if (!reading) continue;

        // Save reading
        const savedReading = await _SoilMoistureReading.SoilMoistureReading.create({
          sensor: sensor._id,
          moisture: reading.moisture,
          temperature: reading.temperature,
          saturationLevel: this._classifySaturation(reading.moisture),
          dataSource: reading.dataSource || 'SIMULATED',
          readingAt: new Date()
        });

        // Update sensor state
        const trend = this._calculateTrend(sensor.recentReadings, reading.moisture);
        const status = reading.moisture >= sensor.thresholdCritical ? 'CRITICAL'
          : reading.moisture >= sensor.thresholdWarning ? 'WARNING'
          : 'NORMAL';

        // Keep last 10 readings for quick trend display
        const recentReadings = [
          { value: reading.moisture, timestamp: new Date() },
          ...(sensor.recentReadings || []).slice(0, 9)
        ];

        await _SoilMoistureSensor.SoilMoistureSensor.findByIdAndUpdate(sensor._id, {
          currentMoisture: reading.moisture,
          currentStatus: status,
          lastReading: new Date(),
          trend,
          recentReadings
        });

        collected++;
      } catch (error) {
        _logger.logger.error({ sensorId: sensor.sensorId, error: error.message }, 'Sensor reading failed');
      }
    }

    _logger.logger.info(`✅ Collected ${collected}/${sensors.length} sensor readings`);
    return collected;
  }

  /**
   * Get latest reading for a zone
   */
  async getLatestForZone(zoneId) {
    const sensors = await _SoilMoistureSensor.SoilMoistureSensor.find({
      riskZone: zoneId,
      status: 'ACTIVE'
    }).lean();

    if (sensors.length === 0) return null;

    // Average across sensors in zone
    const avgMoisture = sensors.reduce((sum, s) => sum + (s.currentMoisture || 0), 0) / sensors.length;
    
    // Use most concerning trend
    const trends = sensors.map(s => s.trend).filter(Boolean);
    const trend = trends.includes('RAPIDLY_INCREASING') ? 'RAPIDLY_INCREASING'
      : trends.includes('INCREASING') ? 'INCREASING'
      : trends.includes('STABLE') ? 'STABLE'
      : 'DECREASING';

    return {
      current: Math.round(avgMoisture),
      trend,
      saturationLevel: this._classifySaturation(avgMoisture),
      sensorCount: sensors.length,
      readings: sensors.map(s => s.currentMoisture)
    };
  }

  /**
   * Get all sensors with current status
   */
  async getAllSensors() {
    return _SoilMoistureSensor.SoilMoistureSensor.find()
      .populate('riskZone', 'zoneId name riskLevel')
      .sort({ currentStatus: -1 })
      .lean();
  }

  /**
   * Get readings history for a sensor
   */
  async getSensorReadings(sensorId, hours = 72) {
    const sensor = await _SoilMoistureSensor.SoilMoistureSensor.findOne({ sensorId });
    if (!sensor) return null;

    const since = new Date(Date.now() - hours * 3600000);
    const readings = await _SoilMoistureReading.SoilMoistureReading.find({
      sensor: sensor._id,
      readingAt: { $gte: since }
    }).sort({ readingAt: -1 }).lean();

    return { sensor, readings };
  }

  // --- Private methods ---

  _classifySaturation(moisture) {
    if (moisture >= 90) return 'SATURATED';
    if (moisture >= 75) return 'VERY_WET';
    if (moisture >= 55) return 'WET';
    if (moisture >= 30) return 'NORMAL';
    return 'DRY';
  }

  _calculateTrend(recentReadings, currentValue) {
    if (!recentReadings || recentReadings.length < 2) return 'STABLE';
    
    const recent = recentReadings.slice(0, 4).map(r => r.value);
    const avgRecent = recent.reduce((s, v) => s + v, 0) / recent.length;
    const diff = currentValue - avgRecent;

    if (diff > 10) return 'RAPIDLY_INCREASING';
    if (diff > 3) return 'INCREASING';
    if (diff < -3) return 'DECREASING';
    return 'STABLE';
  }

  _simulateReading(sensor) {
    // Simple simulation that trends based on current value
    const base = sensor.currentMoisture || 45;
    const variation = (Math.random() - 0.4) * 8; // slight upward bias
    const moisture = Math.max(10, Math.min(98, base + variation));

    return {
      moisture: Math.round(moisture * 10) / 10,
      temperature: 18 + Math.random() * 12,
      dataSource: 'SIMULATED'
    };
  }
}

exports.SoilMoistureService = SoilMoistureService;
const soilMoistureService = exports.soilMoistureService = new SoilMoistureService();
