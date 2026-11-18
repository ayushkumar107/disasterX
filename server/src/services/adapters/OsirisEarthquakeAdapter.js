"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsirisEarthquakeAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");

/**
 * OsirisEarthquakeAdapter
 *
 * Fetches earthquake data from OSIRIS (https://osirisai.live/api/earthquakes).
 * Acts as a redundancy / supplemental source alongside the primary USGSAdapter.
 *
 * OSIRIS pre-parses the USGS GeoJSON feed into a simpler flat structure.
 * We normalise it into our IDisaster schema with the `osiris-eq-` prefix
 * so deduplication with USGSAdapter's `usgs-` prefix happens naturally
 * (they won't collide in the externalId uniqueness check — both are kept).
 *
 * Only earthquakes with magnitude >= 4.0 are ingested, matching the
 * USGSAdapter threshold.
 */
class OsirisEarthquakeAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('OSIRIS_EARTHQUAKE', _env.env.OSIRIS_API_URL);
  }

  async fetchData() {
    _logger.logger.info(`Fetching earthquake data from ${this.sourceName}...`);

    const data = await this.makeRequest('/earthquakes');
    if (!data || !data.earthquakes) {
      return [];
    }

    const disasters = [];

    for (const eq of data.earthquakes) {
      const mag = eq.magnitude;

      // Only track significant earthquakes (magnitude >= 4.0)
      if (mag < 4.0) continue;

      if (!this.isValidCoordinate(eq.lng, eq.lat)) continue;

      const severity = this.calculateSeverity(mag);

      disasters.push({
        externalId: `osiris-eq-${eq.id}`,
        source: this.sourceName,
        type: 'EARTHQUAKE',
        title: `M${mag.toFixed(1)} Earthquake — ${eq.place}`,
        description: `An earthquake of magnitude ${mag.toFixed(1)} occurred ${eq.place}. Depth: ${eq.depth} km.`,
        location: {
          type: 'Point',
          coordinates: [eq.lng, eq.lat]
        },
        affectedRadius: this.calculateRadius(mag),
        severity,
        status: 'ACTIVE',
        startDate: new Date(eq.time),
        confidence: 99,
        metadata: {
          magnitude: mag,
          depth: eq.depth,
          url: eq.url,
          alert: eq.alert,
          tsunami: eq.tsunami,
          felt: eq.felt
        }
      });
    }

    _logger.logger.info(`Successfully parsed ${disasters.length} earthquakes from OSIRIS`);
    return disasters;
  }

  calculateSeverity(mag) {
    if (mag >= 7.0) return 'CRITICAL';
    if (mag >= 6.0) return 'HIGH';
    if (mag >= 5.0) return 'MEDIUM';
    return 'LOW';
  }

  calculateRadius(mag) {
    if (mag >= 8.0) return 300;
    if (mag >= 7.0) return 150;
    if (mag >= 6.0) return 80;
    if (mag >= 5.0) return 40;
    return 20;
  }
}
exports.OsirisEarthquakeAdapter = OsirisEarthquakeAdapter;
