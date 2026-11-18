"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsirisWeatherAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");

/**
 * OsirisWeatherAdapter
 *
 * Fetches unified weather / severe-event data from the OSIRIS platform
 * (https://osirisai.live/api/weather).
 *
 * OSIRIS aggregates:
 *  - NASA EONET severe storms (hurricanes, typhoons)
 *  - NOAA / NWS weather alerts (flash-flood warnings, severe weather statements)
 *  - GDACS tropical cyclones, floods, and droughts
 *
 * Each record is normalized to the DisasterLink IDisaster schema and upserted
 * into MongoDB via the standard IngestionService pipeline.
 */
class OsirisWeatherAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('OSIRIS_WEATHER', _env.env.OSIRIS_API_URL);
  }

  async fetchData() {
    _logger.logger.info(`Fetching weather/severe-event data from ${this.sourceName}...`);

    const data = await this.makeRequest('/weather');
    if (!data || !data.events) {
      return [];
    }

    const disasters = [];

    for (const event of data.events) {
      // Skip events without valid coordinates
      if (typeof event.lat !== 'number' || typeof event.lng !== 'number') continue;
      if (!this.isValidCoordinate(event.lng, event.lat)) continue;

      const mapped = this.mapEvent(event);
      if (!mapped) continue;

      disasters.push({
        externalId: `osiris-weather-${event.id}`,
        source: this.sourceName,
        type: mapped.type,
        title: event.title,
        description: this.buildDescription(event),
        location: {
          type: 'Point',
          coordinates: [event.lng, event.lat]
        },
        affectedRadius: mapped.radius,
        severity: mapped.severity,
        status: 'ACTIVE',
        startDate: new Date(event.date),
        endDate: event.expires ? new Date(event.expires) : undefined,
        confidence: mapped.confidence,
        metadata: {
          osirisId: event.id,
          category: event.category,
          eventType: event.type,
          provider: event.provider,
          area: event.area || undefined,
          sourceUrl: event.source
        }
      });
    }

    _logger.logger.info(`Successfully parsed ${disasters.length} weather/severe events from OSIRIS`);
    return disasters;
  }

  /**
   * Maps an OSIRIS weather event to our internal disaster type, severity,
   * affected radius, and confidence score.
   */
  mapEvent(event) {
    const type = (event.type || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    const severity = (event.severity || 'low').toLowerCase();

    // --- Flash Flood / Flood Warnings ---
    if (type.includes('flash flood warning')) {
      return { type: 'FLOOD', severity: 'CRITICAL', radius: 60, confidence: 95 };
    }
    if (type.includes('flood warning') || type.includes('flood advisory')) {
      return { type: 'FLOOD', severity: 'HIGH', radius: 50, confidence: 90 };
    }
    if (type === 'flood') {
      return { type: 'FLOOD', severity: this.mapSeverity(severity), radius: 80, confidence: 90 };
    }

    // --- Tropical Cyclones / Hurricanes / Typhoons ---
    if (type.includes('tropical cyclone') || type.includes('hurricane') || type.includes('typhoon')) {
      return { type: 'CYCLONE', severity: this.mapSeverity(severity), radius: 200, confidence: 92 };
    }
    if (type === 'severe storm') {
      return { type: 'CYCLONE', severity: 'HIGH', radius: 150, confidence: 92 };
    }

    // --- Severe Weather Statements ---
    if (type.includes('severe weather') || type.includes('special weather')) {
      return { type: 'SEVERE_WEATHER', severity: 'MEDIUM', radius: 60, confidence: 85 };
    }

    // --- Drought ---
    if (type === 'drought') {
      return { type: 'OTHER', severity: this.mapSeverity(severity), radius: 200, confidence: 80 };
    }

    // --- GDACS & EONET events from the weather feed ---
    if (category === 'gdacs' || category === 'severestorms' || category === 'weatheralerts') {
      return {
        type: this.inferTypeFromCategory(type),
        severity: this.mapSeverity(severity),
        radius: 80,
        confidence: 88
      };
    }

    // Skip unrecognised types to avoid noise
    return null;
  }

  /**
   * Converts OSIRIS severity strings to our enum.
   */
  mapSeverity(severity) {
    const map = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'critical': 'CRITICAL'
    };
    return map[severity] || 'LOW';
  }

  /**
   * Best-effort type inference for generic GDACS / EONET records.
   */
  inferTypeFromCategory(type) {
    const t = type.toLowerCase();
    if (t.includes('flood')) return 'FLOOD';
    if (t.includes('cyclone') || t.includes('storm') || t.includes('hurricane') || t.includes('typhoon')) return 'CYCLONE';
    if (t.includes('earthquake')) return 'EARTHQUAKE';
    if (t.includes('volcano')) return 'VOLCANO';
    if (t.includes('wildfire') || t.includes('fire')) return 'WILDFIRE';
    if (t.includes('drought')) return 'OTHER';
    if (t.includes('landslide')) return 'LANDSLIDE';
    return 'SEVERE_WEATHER';
  }

  buildDescription(event) {
    const parts = [event.title];
    if (event.area) parts.push(`Affected area: ${event.area}`);
    if (event.provider) parts.push(`Source: ${event.provider}`);
    return parts.join('. ');
  }
}
exports.OsirisWeatherAdapter = OsirisWeatherAdapter;
