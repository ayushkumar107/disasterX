"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EONETAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");
class EONETAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('NASA_EONET', _env.env.EONET_API_URL);
  }
  async fetchData() {
    _logger.logger.info(`Fetching natural event data from ${this.sourceName}...`);

    // Fetch active events from the last 14 days
    const data = await this.makeRequest('/events?status=open&days=14');
    if (!data || !data.events) {
      return [];
    }
    const disasters = [];
    for (const event of data.events) {
      // EONET returns multiple geometries per event (e.g. tracking a storm path).
      // We'll use the latest known position.
      if (!event.geometry || event.geometry.length === 0) continue;
      const latestGeo = event.geometry[event.geometry.length - 1];
      let coordinates = latestGeo.coordinates;
      let type = 'Point';

      // Sometimes coordinates are polygons, for simplicity we'll just take the first point if so
      if (latestGeo.type === 'Polygon') {
        coordinates = coordinates[0][0]; // Extract first point of the outer ring
      } else if (latestGeo.type === 'LineString') {
        coordinates = coordinates[0];
      }
      if (!Array.isArray(coordinates) || coordinates.length < 2) continue;
      const [lng, lat] = coordinates;
      if (!this.isValidCoordinate(lng, lat)) continue;
      const categoryMap = this.mapCategory(event.categories[0]?.id);
      if (!categoryMap) continue; // Skip unsupported categories

      disasters.push({
        externalId: `eonet-${event.id}`,
        source: this.sourceName,
        type: categoryMap.type,
        title: event.title,
        description: `NASA EONET Active Event: ${event.title}`,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        affectedRadius: categoryMap.radius,
        severity: categoryMap.severity,
        status: 'ACTIVE',
        startDate: new Date(latestGeo.date),
        confidence: 95,
        metadata: {
          eonetId: event.id,
          categories: event.categories.map(c => c.title),
          sources: event.sources.map(s => s.url)
        }
      });
    }
    _logger.logger.info(`Successfully parsed ${disasters.length} events from NASA EONET`);
    return disasters;
  }
  mapCategory(categoryId) {
    // EONET category IDs
    const mapping = {
      'wildfires': {
        type: 'WILDFIRE',
        severity: 'HIGH',
        radius: 30
      },
      'severeStorms': {
        type: 'SEVERE_WEATHER',
        severity: 'HIGH',
        radius: 100
      },
      'volcanoes': {
        type: 'VOLCANO',
        severity: 'MEDIUM',
        radius: 40
      },
      'seaLakeIce': {
        type: 'OTHER',
        severity: 'LOW',
        radius: 20
      },
      'earthquakes': {
        type: 'EARTHQUAKE',
        severity: 'HIGH',
        radius: 60
      },
      'snow': {
        type: 'SEVERE_WEATHER',
        severity: 'MEDIUM',
        radius: 80
      },
      'temperatureExtremes': {
        type: 'SEVERE_WEATHER',
        severity: 'HIGH',
        radius: 150
      },
      'floods': {
        type: 'FLOOD',
        severity: 'HIGH',
        radius: 80
      },
      'drought': {
        type: 'OTHER',
        severity: 'MEDIUM',
        radius: 200
      },
      'dustHaze': {
        type: 'OTHER',
        severity: 'LOW',
        radius: 150
      },
      'manmade': {
        type: 'OTHER',
        severity: 'MEDIUM',
        radius: 10
      },
      'landslides': {
        type: 'LANDSLIDE',
        severity: 'HIGH',
        radius: 15
      },
      'waterColor': {
        type: 'OTHER',
        severity: 'LOW',
        radius: 10
      }
    };
    return mapping[categoryId] || null;
  }
}
exports.EONETAdapter = EONETAdapter;
