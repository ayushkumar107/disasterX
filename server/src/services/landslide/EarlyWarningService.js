"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.earlyWarningService = exports.EarlyWarningService = void 0;
var _EarlyWarning = require("../../models/EarlyWarning");
var _LandslideRiskZone = require("../../models/LandslideRiskZone");
var _Notification = require("../../models/Notification");
var _User = require("../../models/User");
var _logger = require("../../utils/logger");

// Warning thresholds
const WARNING_THRESHOLDS = {
  WATCH: { minProbability: 30, minRiskLevel: 'MODERATE' },
  ADVISORY: { minProbability: 45, minRiskLevel: 'ELEVATED' },
  WARNING: { minProbability: 65, minRiskLevel: 'HIGH' },
  CRITICAL_WARNING: { minProbability: 80, minRiskLevel: 'CRITICAL' }
};

const RISK_LEVEL_ORDER = { LOW: 0, MODERATE: 1, ELEVATED: 2, HIGH: 3, CRITICAL: 4 };

class EarlyWarningService {
  /**
   * Evaluate all zones and generate/update warnings as needed
   */
  async evaluateWarnings() {
    _logger.logger.info('⚠️ Evaluating early warning conditions...');
    
    const zones = await _LandslideRiskZone.LandslideRiskZone.find({
      status: { $in: ['ACTIVE', 'MONITORING'] }
    }).lean();

    let newWarnings = 0;
    let updatedWarnings = 0;
    let expiredWarnings = 0;

    for (const zone of zones) {
      try {
        const result = await this._evaluateZoneWarning(zone);
        if (result === 'NEW') newWarnings++;
        else if (result === 'UPDATED') updatedWarnings++;
        else if (result === 'EXPIRED') expiredWarnings++;
      } catch (error) {
        _logger.logger.error({ zoneId: zone.zoneId, error: error.message }, 'Warning evaluation failed');
      }
    }

    // Expire old warnings
    const expired = await _EarlyWarning.EarlyWarning.updateMany(
      { status: 'ACTIVE', validUntil: { $lt: new Date() } },
      { $set: { status: 'EXPIRED' } }
    );
    expiredWarnings += expired.modifiedCount;

    _logger.logger.info(`⚠️ Warnings: ${newWarnings} new, ${updatedWarnings} updated, ${expiredWarnings} expired`);
    return { newWarnings, updatedWarnings, expiredWarnings };
  }

  /**
   * Get all active warnings
   */
  async getActiveWarnings() {
    return _EarlyWarning.EarlyWarning.find({ status: 'ACTIVE' })
      .populate('zone', 'zoneId name state district riskLevel probability')
      .sort({ warningLevel: -1, issuedAt: -1 })
      .lean();
  }

  /**
   * Get warnings for a specific zone
   */
  async getWarningsForZone(zoneId) {
    return _EarlyWarning.EarlyWarning.find({ zone: zoneId })
      .sort({ issuedAt: -1 })
      .limit(20)
      .lean();
  }

  /**
   * Get warning by ID
   */
  async getWarningById(id) {
    return _EarlyWarning.EarlyWarning.findById(id)
      .populate('zone', 'zoneId name state district riskLevel probability affectedVillages affectedRoads')
      .lean();
  }

  /**
   * Cancel a warning manually
   */
  async cancelWarning(warningId, userId) {
    const warning = await _EarlyWarning.EarlyWarning.findByIdAndUpdate(warningId, {
      $set: { status: 'CANCELLED' },
      $push: { acknowledgedBy: userId }
    }, { new: true });
    
    return warning;
  }

  // --- Private methods ---

  async _evaluateZoneWarning(zone) {
    const probability = zone.probability || 0;
    const riskLevel = zone.riskLevel || 'LOW';
    const riskLevelNum = RISK_LEVEL_ORDER[riskLevel] || 0;

    // Determine appropriate warning level
    let warningLevel = null;
    if (probability >= WARNING_THRESHOLDS.CRITICAL_WARNING.minProbability && riskLevelNum >= RISK_LEVEL_ORDER.CRITICAL) {
      warningLevel = 'CRITICAL_WARNING';
    } else if (probability >= WARNING_THRESHOLDS.WARNING.minProbability && riskLevelNum >= RISK_LEVEL_ORDER.HIGH) {
      warningLevel = 'WARNING';
    } else if (probability >= WARNING_THRESHOLDS.ADVISORY.minProbability && riskLevelNum >= RISK_LEVEL_ORDER.ELEVATED) {
      warningLevel = 'ADVISORY';
    } else if (probability >= WARNING_THRESHOLDS.WATCH.minProbability && riskLevelNum >= RISK_LEVEL_ORDER.MODERATE) {
      warningLevel = 'WATCH';
    }

    // Check for existing active warning
    const existingWarning = await _EarlyWarning.EarlyWarning.findOne({
      zone: zone._id,
      status: 'ACTIVE'
    });

    // No warning needed
    if (!warningLevel) {
      if (existingWarning) {
        existingWarning.status = 'EXPIRED';
        await existingWarning.save();
        return 'EXPIRED';
      }
      return null;
    }

    // Update existing warning if level changed
    if (existingWarning) {
      if (existingWarning.warningLevel !== warningLevel) {
        existingWarning.escalationHistory.push({
          fromLevel: existingWarning.warningLevel,
          toLevel: warningLevel,
          reason: `Risk probability changed to ${probability}%`,
          timestamp: new Date()
        });
        existingWarning.warningLevel = warningLevel;
        existingWarning.probability = probability;
        existingWarning.riskLevel = riskLevel;
        existingWarning.confidence = zone.confidence || 0;
        existingWarning.validUntil = new Date(Date.now() + 24 * 3600000);
        existingWarning.status = 'ACTIVE';
        await existingWarning.save();
        try {
          const { emitWarning } = require('../../config/socketio');
          emitWarning(existingWarning);
        } catch (e) {
          _logger.logger.error('Failed to emit updated warning: ' + e.message);
        }
        return 'UPDATED';
      }
      // Same level — just update probability
      existingWarning.probability = probability;
      existingWarning.confidence = zone.confidence || 0;
      await existingWarning.save();
      try {
        const { emitWarning } = require('../../config/socketio');
        emitWarning(existingWarning);
      } catch (e) { /* ignore */ }
      return null;
    }

    // Create new warning
    const triggers = this._buildTriggers(zone);
    const reason = this._buildReason(warningLevel, zone);
    const recommendedActions = this._getActions(warningLevel);

    const warning = await _EarlyWarning.EarlyWarning.create({
      zone: zone._id,
      warningLevel,
      probability,
      riskLevel,
      confidence: zone.confidence || 0,
      location: zone.location,
      state: zone.state,
      district: zone.district,
      reason,
      riskDriverSummary: this._buildDriverSummary(zone.riskDrivers),
      triggers,
      affectedVillages: zone.affectedVillages || [],
      affectedRoads: zone.affectedRoads || [],
      estimatedAffectedPopulation: (zone.affectedVillages || []).reduce((sum, v) => sum + (v.population || 0), 0),
      recommendedActions,
      validUntil: new Date(Date.now() + 24 * 3600000),
      dataSources: [zone.dataSource || 'SIMULATED']
    });

    // Link warning to zone
    await _LandslideRiskZone.LandslideRiskZone.findByIdAndUpdate(zone._id, {
      activeWarning: warning._id
    });

    try {
      const { emitWarning } = require('../../config/socketio');
      emitWarning(warning);
    } catch (e) {
      _logger.logger.error('Failed to emit new warning: ' + e.message);
    }

    // Send notifications for HIGH/CRITICAL warnings
    if (warningLevel === 'WARNING' || warningLevel === 'CRITICAL_WARNING') {
      await this._sendWarningNotifications(warning, zone);
    }

    return 'NEW';
  }

  _buildTriggers(zone) {
    const triggers = [];
    const cond = zone.currentConditions || {};
    const drivers = zone.riskDrivers || {};
    
    if (cond.rainfall24h && cond.rainfall24h > 64) {
      triggers.push({ factor: 'rainfall', description: `Heavy 24h rainfall: ${cond.rainfall24h}mm`, value: `${cond.rainfall24h}mm` });
    }
    if (cond.soilMoisture && cond.soilMoisture > 70) {
      triggers.push({ factor: 'soilMoisture', description: `High soil moisture: ${cond.soilMoisture}%`, value: `${cond.soilMoisture}%` });
    }
    if (zone.terrain && zone.terrain.avgSlope > 25) {
      triggers.push({ factor: 'slope', description: `Steep slope: ${zone.terrain.avgSlope}°`, value: `${zone.terrain.avgSlope}°` });
    }
    if (drivers.historicalSusceptibility > 5) {
      triggers.push({ factor: 'historical', description: 'High historical susceptibility', value: 'HIGH' });
    }
    
    return triggers;
  }

  _buildReason(level, zone) {
    const reasons = [];
    const cond = zone.currentConditions || {};
    
    if (cond.rainfallIntensity && ['HEAVY', 'VERY_HEAVY', 'EXTREME'].includes(cond.rainfallIntensity)) {
      reasons.push('heavy rainfall');
    }
    if (cond.soilMoistureTrend === 'RAPIDLY_INCREASING') {
      reasons.push('rapidly increasing soil moisture');
    }
    if (zone.terrain && zone.terrain.avgSlope > 30) {
      reasons.push('steep terrain');
    }
    
    const reasonStr = reasons.length > 0 ? ` due to ${reasons.join(', ')}` : '';
    return `${level.replace('_', ' ')} issued for ${zone.name}${reasonStr}. Landslide probability: ${zone.probability}%.`;
  }

  _buildDriverSummary(drivers) {
    if (!drivers) return '';
    const sorted = Object.entries(drivers)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);
    
    return sorted.map(([k, v]) => `${k}: +${v}`).join(', ');
  }

  _getActions(level) {
    switch (level) {
      case 'CRITICAL_WARNING':
        return [
          'Evacuate at-risk areas immediately',
          'Close affected roads',
          'Deploy rescue teams to staging areas',
          'Activate emergency shelters',
          'Issue public alerts via all channels'
        ];
      case 'WARNING':
        return [
          'Prepare for possible evacuation',
          'Send field inspection teams',
          'Alert local authorities',
          'Pre-position rescue resources',
          'Monitor roads for blockages'
        ];
      case 'ADVISORY':
        return [
          'Increase monitoring frequency',
          'Notify district disaster management',
          'Prepare field teams for deployment',
          'Check road conditions'
        ];
      case 'WATCH':
        return [
          'Continue monitoring',
          'Track weather forecasts',
          'Review evacuation routes'
        ];
      default:
        return ['Continue routine monitoring'];
    }
  }

  async _sendWarningNotifications(warning, zone) {
    try {
      // Notify all ADMIN and RESCUE_TEAM users
      const users = await _User.User.find({
        role: { $in: ['ADMIN', 'RESCUE_TEAM'] }
      }).select('_id');

      const notifications = users.map(user => ({
        recipient: user._id,
        type: 'EARLY_WARNING',
        title: `${warning.warningLevel.replace('_', ' ')}: ${zone.name}`,
        message: warning.reason,
        severity: warning.warningLevel === 'CRITICAL_WARNING' ? 'CRITICAL' : 'WARNING',
        data: {
          warningId: warning._id,
          zoneId: zone.zoneId,
          probability: warning.probability,
          riskLevel: warning.riskLevel
        }
      }));

      if (notifications.length > 0) {
        await _Notification.Notification.insertMany(notifications);
        await _EarlyWarning.EarlyWarning.findByIdAndUpdate(warning._id, {
          notificationsSent: notifications.length
        });
      }
    } catch (error) {
      _logger.logger.error({ error: error.message }, 'Failed to send warning notifications');
    }
  }
}

exports.EarlyWarningService = EarlyWarningService;
const earlyWarningService = exports.earlyWarningService = new EarlyWarningService();
