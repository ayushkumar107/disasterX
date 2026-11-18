"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsirisHazardsAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");

/**
 * OsirisHazardsAdapter
 *
 * Fetches global conflict, war zone, and disaster hazard alerts from the OSIRIS platform
 * (https://osirisai.live/api/conflicts).
 *
 * OSIRIS /api/conflicts returns:
 *  - zones: High-risk global hazard & war zones (Ukraine, Red Sea, Yemen, Sudan, Gaza, Taiwan Strait)
 *  - liveEvents: Geotagged live conflict / hazard incidents
 */
class OsirisHazardsAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('OSIRIS_HAZARDS', _env.env.OSIRIS_API_URL);
  }

  async fetchData() {
    _logger.logger.info(`Fetching hazard & conflict zone data from ${this.sourceName}...`);

    const data = await this.makeRequest('/conflicts');
    if (!data) {
      return [];
    }

    const disasters = [];

    // Parse hazard / war zones
    if (Array.isArray(data.zones)) {
      for (const zone of data.zones) {
        if (!this.isValidCoordinate(zone.lng, zone.lat)) continue;

        const severity = this.mapSeverity(zone.severity);

        disasters.push({
          externalId: `osiris-hazard-${zone.id}`,
          source: this.sourceName,
          type: 'OTHER',
          title: zone.label || zone.name || 'Global Hazard Zone',
          description: zone.description || `Active OSIRIS hazard zone in ${zone.region || 'global sector'}.`,
          location: {
            type: 'Point',
            coordinates: [zone.lng, zone.lat]
          },
          affectedRadius: 150,
          severity,
          status: 'ACTIVE',
          startDate: new Date(zone.lastUpdated || Date.now()),
          confidence: 90,
          metadata: {
            osirisId: zone.id,
            category: 'global_incidents',
            region: zone.region,
            eventCount: zone.eventCount || (zone.events ? zone.events.length : 0),
            sourceUrl: zone.sourceUrl
          }
        });
      }
    }

    // Parse geotagged live events
    if (Array.isArray(data.liveEvents)) {
      for (const ev of data.liveEvents) {
        if (!this.isValidCoordinate(ev.lng, ev.lat)) continue;

        disasters.push({
          externalId: `osiris-event-${ev.id}`,
          source: this.sourceName,
          type: 'SEVERE_WEATHER',
          title: ev.title,
          description: `Live incident report: ${ev.title}`,
          location: {
            type: 'Point',
            coordinates: [ev.lng, ev.lat]
          },
          affectedRadius: 50,
          severity: 'HIGH',
          status: 'ACTIVE',
          startDate: new Date(ev.timestamp || Date.now()),
          confidence: 88,
          metadata: {
            osirisId: ev.id,
            eventType: ev.type,
            sourceUrl: ev.url
          }
        });
      }
    }

    _logger.logger.info(`Successfully parsed ${disasters.length} hazard hazards/zones from OSIRIS`);
    return disasters;
  }

  mapSeverity(severity) {
    const s = (severity || '').toLowerCase();
    if (s === 'war' || s === 'critical') return 'CRITICAL';
    if (s === 'high') return 'HIGH';
    if (s === 'medium') return 'MEDIUM';
    return 'LOW';
  }
}
exports.OsirisHazardsAdapter = OsirisHazardsAdapter;
