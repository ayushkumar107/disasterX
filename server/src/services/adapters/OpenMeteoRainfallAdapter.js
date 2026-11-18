"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenMeteoRainfallAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _logger = require("../../utils/logger");

/**
 * Open-Meteo Rainfall Adapter
 * Uses the free Open-Meteo API for rainfall and weather data.
 * No API key required.
 */
class OpenMeteoRainfallAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('OPEN_METEO', 'https://api.open-meteo.com/v1');
    this.providerName = 'OPEN_METEO';
    this.dataSource = 'LIVE';
  }

  async fetchRainfall(lat, lng) {
    try {
      const data = await this.makeRequest('/forecast', {
        latitude: lat,
        longitude: lng,
        current: 'temperature_2m,relative_humidity_2m,rain,weather_code',
        hourly: 'rain,soil_moisture_0_to_7cm',
        daily: 'rain_sum',
        past_days: 3,
        forecast_days: 2,
        timezone: 'Asia/Kolkata'
      });

      if (!data) return null;

      // Calculate cumulative rainfall from hourly data
      const hourlyRain = data.hourly?.rain || [];
      const hourlyTime = data.hourly?.time || [];
      const now = new Date();
      
      let rainfall1h = 0, rainfall6h = 0, rainfall24h = 0, rainfall72h = 0;
      let forecastRainfall24h = 0;

      for (let i = 0; i < hourlyTime.length; i++) {
        const t = new Date(hourlyTime[i]);
        const diffHours = (now - t) / 3600000;
        const rain = hourlyRain[i] || 0;

        if (diffHours >= 0 && diffHours <= 1) rainfall1h += rain;
        if (diffHours >= 0 && diffHours <= 6) rainfall6h += rain;
        if (diffHours >= 0 && diffHours <= 24) rainfall24h += rain;
        if (diffHours >= 0 && diffHours <= 72) rainfall72h += rain;
        
        // Future hours (forecast)
        if (diffHours < 0 && diffHours >= -24) forecastRainfall24h += rain;
      }

      // Get soil moisture if available
      const soilMoisture = data.hourly?.soil_moisture_0_to_7cm;
      const latestSoilMoisture = soilMoisture ? soilMoisture[soilMoisture.length - 1] : null;

      // Daily forecast accumulation
      const dailyRainSum = data.daily?.rain_sum || [];
      const forecastAccumulation = dailyRainSum.slice(-2).reduce((sum, v) => sum + (v || 0), 0);

      // Historical average estimate (rough NER monsoon average: ~10mm/day)
      const historicalAverage = 10;
      const anomaly = historicalAverage > 0 ? ((rainfall24h - historicalAverage) / historicalAverage) * 100 : 0;

      return {
        currentRainfall: data.current?.rain || 0,
        temperature: data.current?.temperature_2m,
        humidity: data.current?.relative_humidity_2m,
        rainfall1h: Math.round(rainfall1h * 10) / 10,
        rainfall6h: Math.round(rainfall6h * 10) / 10,
        rainfall24h: Math.round(rainfall24h * 10) / 10,
        rainfall72h: Math.round(rainfall72h * 10) / 10,
        historicalAverage,
        anomaly: Math.round(anomaly),
        forecastRainfall24h: Math.round(forecastRainfall24h * 10) / 10,
        forecastRainfall48h: forecastAccumulation,
        forecastAccumulation: Math.round(forecastAccumulation * 10) / 10,
        soilMoisture: latestSoilMoisture ? Math.round(latestSoilMoisture * 100) : null,
        stationName: `Open-Meteo ${lat.toFixed(2)}°N ${lng.toFixed(2)}°E`
      };
    } catch (error) {
      _logger.logger.error({ error: error.message, lat, lng }, 'Open-Meteo rainfall fetch failed');
      return null;
    }
  }
}

exports.OpenMeteoRainfallAdapter = OpenMeteoRainfallAdapter;
