"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GDACSAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");
class GDACSAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('GDACS', _env.env.GDACS_API_URL);
  }
  async fetchData() {
    _logger.logger.info(`Fetching disaster data from ${this.sourceName}...`);

    // Fetch events from GDACS JSON API
    const data = await this.makeRequest('/events/getmacromap.json');
    if (!data || !data.features) {
      return [];
    }
    const disasters = [];
    for (const feature of data.features) {
      const {
        properties,
        geometry
      } = feature;
      const [lng, lat] = geometry.coordinates;
      if (!this.isValidCoordinate(lng, lat)) continue;

      // GDACS Alert levels: Green, Orange, Red
      // We map these to our severities
      const severityMap = {
        'Green': 'LOW',
        'Orange': 'MEDIUM',
        'Red': 'CRITICAL'
      };
      const typeMap = {
        'EQ': 'EARTHQUAKE',
        'TC': 'CYCLONE',
        'FL': 'FLOOD',
        'VO': 'VOLCANO',
        'DR': 'OTHER',
        // Drought
        'WF': 'WILDFIRE'
      };
      const eventType = typeMap[properties.eventtype] || 'OTHER';
      const severity = severityMap[properties.alertscore] || 'LOW';

      // Skip low severity non-earthquake events to reduce noise
      if (severity === 'LOW' && eventType !== 'EARTHQUAKE') continue;
      disasters.push({
        externalId: `gdacs-${properties.eventid}`,
        source: this.sourceName,
        type: eventType,
        title: properties.name || `${properties.eventtype} — ${properties.country}`,
        description: properties.description || `GDACS Alert for ${properties.eventtype} in ${properties.country}`,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        affectedRadius: this.calculateRadius(eventType, severity),
        severity,
        status: 'ACTIVE',
        startDate: new Date(properties.fromdate),
        endDate: properties.todate ? new Date(properties.todate) : undefined,
        confidence: 90,
        metadata: {
          gdacsId: properties.eventid,
          country: properties.country,
          episodeId: properties.episodeid,
          alertScore: properties.alertscore,
          populationImpact: properties.population
        }
      });
    }
    _logger.logger.info(`Successfully parsed ${disasters.length} events from GDACS`);
    return disasters;
  }
  calculateRadius(type, severity) {
    const baseRadii = {
      'EARTHQUAKE': 50,
      'CYCLONE': 200,
      'FLOOD': 80,
      'VOLCANO': 40,
      'WILDFIRE': 30,
      'OTHER': 20
    };
    const multiplier = {
      'LOW': 1,
      'MEDIUM': 1.5,
      'HIGH': 2,
      'CRITICAL': 3
    };
    return (baseRadii[type] || 50) * (multiplier[severity] || 1);
  }
}
exports.GDACSAdapter = GDACSAdapter;
