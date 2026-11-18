"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockRainfallAdapter = void 0;
var _logger = require("../../utils/logger");

/**
 * Mock Rainfall Adapter for development
 * Generates clearly labeled SIMULATED rainfall data for testing.
 */
class MockRainfallAdapter {
  constructor() {
    this.providerName = 'MOCK';
    this.dataSource = 'SIMULATED';
  }

  async fetchRainfall(lat, lng) {
    // Generate monsoon-season-like rainfall patterns
    const baseRain = 5 + Math.random() * 25;  // 5-30 mm/hr base
    const isHeavy = Math.random() > 0.7;       // 30% chance of heavy rain
    const multiplier = isHeavy ? 3 + Math.random() * 4 : 1;

    const currentRainfall = Math.round(baseRain * multiplier * 10) / 10;
    const rainfall1h = currentRainfall;
    const rainfall6h = Math.round(rainfall1h * (3 + Math.random() * 3) * 10) / 10;
    const rainfall24h = Math.round(rainfall6h * (2 + Math.random() * 2) * 10) / 10;
    const rainfall72h = Math.round(rainfall24h * (1.5 + Math.random() * 1.5) * 10) / 10;

    const historicalAverage = 12; // mm/day NER average
    const anomaly = Math.round(((rainfall24h - historicalAverage) / historicalAverage) * 100);

    return {
      currentRainfall,
      temperature: 20 + Math.random() * 10,
      humidity: 70 + Math.random() * 25,
      rainfall1h,
      rainfall6h,
      rainfall24h,
      rainfall72h,
      historicalAverage,
      anomaly,
      forecastRainfall24h: Math.round((10 + Math.random() * 40) * 10) / 10,
      forecastRainfall48h: Math.round((20 + Math.random() * 60) * 10) / 10,
      forecastAccumulation: Math.round((30 + Math.random() * 80) * 10) / 10,
      stationName: `[SIMULATED] Station ${lat.toFixed(2)}°N ${lng.toFixed(2)}°E`
    };
  }
}

exports.MockRainfallAdapter = MockRainfallAdapter;
