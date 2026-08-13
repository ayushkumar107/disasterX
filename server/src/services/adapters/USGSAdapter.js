"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.USGSAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");
class USGSAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('USGS', _env.env.USGS_API_URL);
  }
  async fetchData() {
    _logger.logger.info(`Fetching earthquake data from ${this.sourceName}...`);

    // Fetch all earthquakes from the past day
    const data = await this.makeRequest('/all_day.geojson');
    if (!data || !data.features) {
      return [];
    }
    const disasters = [];
    for (const feature of data.features) {
      const {
        properties,
        geometry,
        id
      } = feature;
      const mag = properties.mag;

      // Only track earthquakes of magnitude >= 4.0
      if (mag < 4.0) continue;
      const [lng, lat, depth] = geometry.coordinates;
      if (!this.isValidCoordinate(lng, lat)) continue;
      const severity = this.calculateSeverity(mag);
      disasters.push({
        externalId: `usgs-${id}`,
        source: this.sourceName,
        type: 'EARTHQUAKE',
        title: `M${mag.toFixed(1)} Earthquake — ${properties.place}`,
        description: `An earthquake of magnitude ${mag.toFixed(1)} occurred ${properties.place}.`,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        affectedRadius: this.calculateRadius(mag),
        severity,
        status: 'ACTIVE',
        startDate: new Date(properties.time),
        confidence: 99,
        metadata: {
          magnitude: mag,
          depth,
          url: properties.url,
          mmi: properties.mmi,
          alert: properties.alert
        }
      });
    }
    _logger.logger.info(`Successfully parsed ${disasters.length} earthquakes from USGS`);
    return disasters;
  }
  calculateSeverity(mag) {
    if (mag >= 7.0) return 'CRITICAL';
    if (mag >= 6.0) return 'HIGH';
    if (mag >= 5.0) return 'MEDIUM';
    return 'LOW';
  }
  calculateRadius(mag) {
    // Rough estimate of affected radius in km based on magnitude
    if (mag >= 8.0) return 300;
    if (mag >= 7.0) return 150;
    if (mag >= 6.0) return 80;
    if (mag >= 5.0) return 40;
    return 20;
  }
}
exports.USGSAdapter = USGSAdapter;
