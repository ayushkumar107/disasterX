"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.responsePriorityService = exports.ResponsePriorityService = void 0;
var _SOS = require("../../models/SOS");
var _LandslideRiskZone = require("../../models/LandslideRiskZone");
var _logger = require("../../utils/logger");

class ResponsePriorityService {
  /**
   * Rank active SOS alerts for immediate triage
   */
  async getPrioritySOSQueue() {
    const alerts = await _SOS.SOS.find({ status: { $in: ['PENDING', 'ACKNOWLEDGED'] } })
      .populate('user', 'name role')
      .lean();

    const rankedAlerts = alerts.map(alert => {
      let priorityScore = 0;

      // 1. Severity weight
      if (alert.severity === 'CRITICAL') priorityScore += 50;
      else if (alert.severity === 'HIGH') priorityScore += 30;
      else priorityScore += 10;

      // 2. Population weight (number of people trapped/at risk)
      const people = alert.numberOfPeople || 1;
      priorityScore += Math.min(30, people * 5);

      // 3. Time elapsed (longer pending = higher priority)
      const minutesPending = (Date.now() - new Date(alert.createdAt)) / 60000;
      priorityScore += Math.min(20, minutesPending * 0.5);

      return {
        ...alert,
        priorityScore: Math.round(priorityScore)
      };
    });

    // Sort descending
    return rankedAlerts.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Get active risk zones sorted by priority/urgency
   */
  async getRiskZonePriorityQueue() {
    const zones = await _LandslideRiskZone.LandslideRiskZone.find({
      status: { $in: ['ACTIVE', 'MONITORING'] }
    }).lean();

    const rankedZones = zones.map(zone => {
      let urgencyScore = zone.probability || 0;

      // Add population modifier
      const totalPop = (zone.affectedVillages || []).reduce((sum, v) => sum + (v.population || 0), 0);
      if (totalPop > 50000) urgencyScore += 15;
      else if (totalPop > 10000) urgencyScore += 10;
      else if (totalPop > 0) urgencyScore += 5;

      // Road blockage risk modifier
      const hasNH = (zone.affectedRoads || []).some(r => r.type === 'NATIONAL_HIGHWAY');
      if (hasNH) urgencyScore += 10;

      return {
        ...zone,
        urgencyScore: Math.min(100, Math.round(urgencyScore))
      };
    });

    return rankedZones.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }
}

exports.ResponsePriorityService = ResponsePriorityService;
const responsePriorityService = exports.responsePriorityService = new ResponsePriorityService();
