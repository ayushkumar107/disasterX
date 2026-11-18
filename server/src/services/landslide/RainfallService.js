"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rainfallService = exports.RainfallService = void 0;
var _RainfallObservation = require("../../models/RainfallObservation");
var _logger = require("../../utils/logger");

class RainfallService {
  constructor() {
    this.adapter = null;
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  /**
   * Fetch and store rainfall data for all monitored locations
   */
  async updateRainfallData(zones) {
    if (!this.adapter) {
      _logger.logger.warn('No rainfall adapter configured');
      return;
    }

    _logger.logger.info(`🌧️ Updating rainfall data for ${zones.length} zones...`);
    let updated = 0;

    for (const zone of zones) {
      try {
        const [lng, lat] = zone.location.coordinates;
        const data = await this.adapter.fetchRainfall(lat, lng);
        
        if (!data) continue;

        await _RainfallObservation.RainfallObservation.create({
          location: zone.location,
          state: zone.state,
          district: zone.district,
          stationName: data.stationName || zone.name,
          currentRainfall: data.currentRainfall,
          temperature: data.temperature,
          humidity: data.humidity,
          rainfall1h: data.rainfall1h,
          rainfall6h: data.rainfall6h,
          rainfall24h: data.rainfall24h,
          rainfall72h: data.rainfall72h,
          historicalAverage: data.historicalAverage,
          anomaly: data.anomaly,
          forecastRainfall24h: data.forecastRainfall24h,
          forecastRainfall48h: data.forecastRainfall48h,
          forecastAccumulation: data.forecastAccumulation,
          intensity: this.classifyIntensity(data.currentRainfall || 0),
          rainfallRiskScore: this.calculateRainfallRisk(data),
          riskZone: zone._id,
          provider: this.adapter.providerName || 'UNKNOWN',
          dataSource: this.adapter.dataSource || 'SIMULATED',
          observedAt: new Date()
        });

        updated++;
      } catch (error) {
        _logger.logger.error({ zoneId: zone.zoneId, error: error.message }, 'Rainfall update failed');
      }
    }

    _logger.logger.info(`✅ Rainfall updated for ${updated}/${zones.length} zones`);
    return updated;
  }

  /**
   * Get latest rainfall observation for a zone
   */
  async getLatestForZone(zoneId) {
    const obs = await _RainfallObservation.RainfallObservation.findOne({ riskZone: zoneId })
      .sort({ observedAt: -1 })
      .lean();
    
    if (!obs) return null;

    return {
      currentRainfall: obs.currentRainfall,
      rainfall1h: obs.rainfall1h,
      rainfall6h: obs.rainfall6h,
      rainfall24h: obs.rainfall24h,
      rainfall72h: obs.rainfall72h,
      historicalAverage: obs.historicalAverage,
      anomaly: obs.anomaly,
      forecastRainfall: obs.forecastRainfall24h,
      intensity: obs.intensity
    };
  }

  /**
   * Get rainfall history for a zone
   */
  async getHistoryForZone(zoneId, hours = 72) {
    const since = new Date(Date.now() - hours * 3600000);
    return _RainfallObservation.RainfallObservation.find({
      riskZone: zoneId,
      observedAt: { $gte: since }
    }).sort({ observedAt: -1 }).lean();
  }

  /**
   * Get all recent rainfall observations
   */
  async getAllLatest() {
    return _RainfallObservation.RainfallObservation.aggregate([
      { $sort: { riskZone: 1, observedAt: -1 } },
      { $group: {
        _id: '$riskZone',
        latest: { $first: '$$ROOT' }
      }},
      { $replaceRoot: { newRoot: '$latest' } }
    ]);
  }

  /**
   * Classify rainfall intensity (IMD classification)
   */
  classifyIntensity(mmPerHour) {
    if (mmPerHour <= 0) return 'NONE';
    if (mmPerHour <= 2.5) return 'LIGHT';
    if (mmPerHour <= 7.5) return 'MODERATE';
    if (mmPerHour <= 15) return 'HEAVY';
    if (mmPerHour <= 30) return 'VERY_HEAVY';
    return 'EXTREME';
  }

  /**
   * Calculate rainfall-derived risk score
   */
  calculateRainfallRisk(data) {
    let score = 0;
    const r24 = data.rainfall24h || 0;
    
    if (r24 >= 204) score = 95;
    else if (r24 >= 115) score = 80;
    else if (r24 >= 64) score = 60;
    else if (r24 >= 35) score = 40;
    else if (r24 >= 15) score = 20;
    else if (r24 > 0) score = 10;

    // Boost for anomaly
    if (data.anomaly && data.anomaly > 50) score = Math.min(100, score + 15);

    return score;
  }
}

exports.RainfallService = RainfallService;
const rainfallService = exports.rainfallService = new RainfallService();
