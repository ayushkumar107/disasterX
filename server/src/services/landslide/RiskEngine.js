"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.riskEngine = exports.RiskEngine = void 0;
var _LandslideRiskZone = require("../../models/LandslideRiskZone");
var _RiskAssessment = require("../../models/RiskAssessment");
var _logger = require("../../utils/logger");

/**
 * PROTOTYPE Landslide Risk Engine
 * 
 * IMPORTANT: This is a prototype risk model using weighted heuristics.
 * It has NOT been trained or validated on real landslide datasets.
 * Results should be treated as probabilistic risk assessments, NOT predictions.
 * 
 * Architecture: RiskModel Interface pattern — this can be swapped with a 
 * trained ML model without changing the rest of the application.
 */

// Feature weight configuration (prototype heuristics)
const FEATURE_WEIGHTS = {
  rainfall: 0.25,
  soilMoisture: 0.20,
  slope: 0.18,
  historicalSusceptibility: 0.12,
  satelliteChange: 0.08,
  citizenReports: 0.05,
  elevation: 0.05,
  landCover: 0.04,
  geology: 0.03
};

// Risk level thresholds
const RISK_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  ELEVATED: 40,
  MODERATE: 20,
  LOW: 0
};

class RiskEngine {
  /**
   * Calculate risk for a specific zone using available data
   * @param {Object} features - All input features for risk calculation
   * @returns {Object} Risk assessment result
   */
  calculateRisk(features) {
    const startTime = Date.now();
    
    // Calculate individual feature scores (0-100)
    const featureScores = {
      rainfall: this._scoreRainfall(features.rainfall || {}),
      soilMoisture: this._scoreSoilMoisture(features.soilMoisture || {}),
      slope: this._scoreSlope(features.terrain || {}),
      historicalSusceptibility: this._scoreHistorical(features.historical || {}),
      satelliteChange: this._scoreSatellite(features.satellite || {}),
      citizenReports: this._scoreCitizenReports(features.citizenReports || {}),
      elevation: this._scoreElevation(features.terrain || {}),
      landCover: this._scoreLandCover(features.terrain || {}),
      geology: this._scoreGeology(features.terrain || {})
    };

    // Calculate weighted probability
    let probability = 0;
    const riskDrivers = {};
    
    for (const [feature, weight] of Object.entries(FEATURE_WEIGHTS)) {
      const score = featureScores[feature] || 0;
      const contribution = Math.round(score * weight);
      probability += contribution;
      riskDrivers[feature] = contribution;
    }

    // Clamp probability
    probability = Math.max(0, Math.min(100, Math.round(probability)));

    // Determine risk level
    const riskLevel = this._classifyRisk(probability);

    // Calculate confidence based on data completeness
    const confidence = this._calculateConfidence(features);

    // Determine recommended action
    const recommendedAction = this._getRecommendedAction(riskLevel, probability);

    const processingTime = Date.now() - startTime;

    return {
      probability,
      riskLevel,
      confidence,
      riskDrivers,
      featureScores,
      recommendedAction,
      modelType: 'PROTOTYPE',
      modelVersion: 'prototype-v1',
      processingTime,
      disclaimer: 'This is a prototype risk assessment. Results have not been validated against real landslide data.'
    };
  }

  /**
   * Run risk evaluation for all active zones
   */
  async evaluateAllZones(rainfallService, soilMoistureService, terrainService) {
    _logger.logger.info('🔄 Running risk evaluation for all active zones...');
    const startTime = Date.now();
    
    const zones = await _LandslideRiskZone.LandslideRiskZone.find({
      status: { $in: ['ACTIVE', 'MONITORING'] }
    });

    let updated = 0;
    let warnings = 0;

    for (const zone of zones) {
      try {
        // Gather features for this zone
        const features = await this._gatherFeatures(zone, rainfallService, soilMoistureService, terrainService);
        
        // Calculate risk
        const result = this.calculateRisk(features);
        
        // Update zone
        zone.probability = result.probability;
        zone.riskLevel = result.riskLevel;
        zone.confidence = result.confidence;
        zone.riskDrivers = result.riskDrivers;
        zone.lastAssessment = new Date();
        zone.assessmentModel = result.modelVersion;
        
        // Update current conditions
        if (features.rainfall) {
          zone.currentConditions = zone.currentConditions || {};
          zone.currentConditions.rainfall24h = features.rainfall.rainfall24h;
          zone.currentConditions.rainfall72h = features.rainfall.rainfall72h;
          zone.currentConditions.rainfallIntensity = features.rainfall.intensity;
        }
        if (features.soilMoisture) {
          zone.currentConditions = zone.currentConditions || {};
          zone.currentConditions.soilMoisture = features.soilMoisture.current;
          zone.currentConditions.soilMoistureTrend = features.soilMoisture.trend;
        }

        await zone.save();

        // Save assessment record
        await _RiskAssessment.RiskAssessment.create({
          zone: zone._id,
          features,
          probability: result.probability,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          riskDrivers: result.riskDrivers,
          modelType: result.modelType,
          modelVersion: result.modelVersion,
          processingTime: result.processingTime,
          recommendedAction: result.recommendedAction,
          dataCompleteness: result.confidence
        });

        updated++;
        if (result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
          warnings++;
        }
      } catch (error) {
        _logger.logger.error({ zoneId: zone.zoneId, error: error.message }, 'Failed to evaluate zone');
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    _logger.logger.info(`✅ Risk evaluation complete in ${duration}s. Zones: ${updated}, High/Critical: ${warnings}`);

    try {
      const { emitRiskUpdate } = require('../../config/socketio');
      const allZones = await _LandslideRiskZone.LandslideRiskZone.find({
        status: { $in: ['ACTIVE', 'MONITORING'] }
      });
      emitRiskUpdate(allZones);
    } catch (e) {
      _logger.logger.error('Failed to emit risk update: ' + e.message);
    }
    
    return { zonesEvaluated: updated, highRiskCount: warnings };
  }

  /**
   * Run a what-if simulation with modified parameters
   */
  simulateScenario(baseFeatures, modifications) {
    const modifiedFeatures = JSON.parse(JSON.stringify(baseFeatures));
    
    // Apply modifications
    if (modifications.rainfallIncrease) {
      const factor = 1 + (modifications.rainfallIncrease / 100);
      if (modifiedFeatures.rainfall) {
        modifiedFeatures.rainfall.rainfall24h = (modifiedFeatures.rainfall.rainfall24h || 0) * factor;
        modifiedFeatures.rainfall.rainfall72h = (modifiedFeatures.rainfall.rainfall72h || 0) * factor;
        modifiedFeatures.rainfall.currentRainfall = (modifiedFeatures.rainfall.currentRainfall || 0) * factor;
      }
    }
    if (modifications.soilMoistureIncrease && modifiedFeatures.soilMoisture) {
      modifiedFeatures.soilMoisture.current = Math.min(100,
        (modifiedFeatures.soilMoisture.current || 0) + modifications.soilMoistureIncrease
      );
    }

    return {
      scenario: modifications,
      result: this.calculateRisk(modifiedFeatures),
      isSimulation: true,
      disclaimer: 'This is a simulated scenario, not a forecast.'
    };
  }

  // --- Private scoring methods ---

  _scoreRainfall(rainfall) {
    if (!rainfall.rainfall24h && !rainfall.currentRainfall) return 0;
    
    let score = 0;
    const r24 = rainfall.rainfall24h || 0;
    const r72 = rainfall.rainfall72h || 0;
    
    // 24h rainfall scoring (IMD-like thresholds)
    if (r24 >= 204) score += 95;       // Extremely heavy
    else if (r24 >= 115) score += 80;  // Very heavy
    else if (r24 >= 64) score += 60;   // Heavy
    else if (r24 >= 35) score += 40;   // Moderate
    else if (r24 >= 15) score += 20;   // Light-moderate
    else if (r24 > 0) score += 10;     // Light

    // 72h cumulative bonus
    if (r72 >= 300) score += 20;
    else if (r72 >= 200) score += 15;
    else if (r72 >= 100) score += 10;

    // Anomaly bonus
    if (rainfall.anomaly && rainfall.anomaly > 50) score += 15;
    else if (rainfall.anomaly && rainfall.anomaly > 25) score += 8;

    // Forecast bonus
    if (rainfall.forecastRainfall && rainfall.forecastRainfall > 100) score += 10;

    return Math.min(100, score);
  }

  _scoreSoilMoisture(sm) {
    if (!sm.current && sm.current !== 0) return 0;
    
    const moisture = sm.current;
    if (moisture >= 90) return 95;
    if (moisture >= 80) return 80;
    if (moisture >= 70) return 60;
    if (moisture >= 55) return 40;
    if (moisture >= 40) return 20;
    return 10;
  }

  _scoreSlope(terrain) {
    if (!terrain.slope && terrain.slope !== 0) return 0;
    
    const slope = terrain.slope;
    if (slope >= 45) return 95;
    if (slope >= 35) return 80;
    if (slope >= 25) return 65;
    if (slope >= 15) return 45;
    if (slope >= 10) return 25;
    return 10;
  }

  _scoreHistorical(historical) {
    if (!historical.previousEvents && !historical.susceptibilityScore) return 0;
    
    let score = historical.susceptibilityScore || 0;
    if (historical.previousEvents >= 5) score = Math.max(score, 80);
    else if (historical.previousEvents >= 3) score = Math.max(score, 60);
    else if (historical.previousEvents >= 1) score = Math.max(score, 40);
    
    return Math.min(100, score);
  }

  _scoreSatellite(satellite) {
    if (!satellite.changeDetected) return 0;
    return satellite.changeMagnitude || 30;
  }

  _scoreCitizenReports(reports) {
    if (!reports.reportCount) return 0;
    
    let score = Math.min(60, reports.reportCount * 15);
    if (reports.avgCredibility && reports.avgCredibility > 70) score += 20;
    return Math.min(100, score);
  }

  _scoreElevation(terrain) {
    if (!terrain.elevation && terrain.elevation !== 0) return 0;
    
    const elev = terrain.elevation;
    // Mid-altitude zones (500-2000m) are typically most susceptible in NER
    if (elev >= 500 && elev <= 2000) return 60;
    if (elev >= 200 && elev < 500) return 40;
    if (elev > 2000 && elev <= 3000) return 50;
    if (elev > 3000) return 30;
    return 15;
  }

  _scoreLandCover(terrain) {
    if (!terrain.landCoverType) return 30; // default moderate
    
    const type = terrain.landCoverType.toLowerCase();
    if (type.includes('bare') || type.includes('rock')) return 80;
    if (type.includes('scrub') || type.includes('sparse')) return 60;
    if (type.includes('agriculture') || type.includes('crop')) return 50;
    if (type.includes('forest') && type.includes('dense')) return 20;
    if (type.includes('forest')) return 30;
    return 40;
  }

  _scoreGeology(terrain) {
    if (!terrain.geologyType) return 30; // default moderate
    
    const geo = terrain.geologyType.toLowerCase();
    if (geo.includes('alluvial') || geo.includes('loose')) return 80;
    if (geo.includes('sedimentary')) return 60;
    if (geo.includes('metamorphic')) return 50;
    if (geo.includes('granite') || geo.includes('hard')) return 20;
    return 40;
  }

  _classifyRisk(probability) {
    if (probability >= RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (probability >= RISK_THRESHOLDS.HIGH) return 'HIGH';
    if (probability >= RISK_THRESHOLDS.ELEVATED) return 'ELEVATED';
    if (probability >= RISK_THRESHOLDS.MODERATE) return 'MODERATE';
    return 'LOW';
  }

  _calculateConfidence(features) {
    let available = 0;
    let total = 9; // total feature categories
    
    if (features.rainfall && (features.rainfall.rainfall24h || features.rainfall.currentRainfall)) available++;
    if (features.soilMoisture && features.soilMoisture.current !== undefined) available++;
    if (features.terrain && features.terrain.slope !== undefined) available++;
    if (features.historical && (features.historical.previousEvents !== undefined || features.historical.susceptibilityScore)) available++;
    if (features.satellite && features.satellite.changeDetected !== undefined) available++;
    if (features.citizenReports && features.citizenReports.reportCount !== undefined) available++;
    if (features.terrain && features.terrain.elevation !== undefined) available++;
    if (features.terrain && features.terrain.landCoverType) available++;
    if (features.terrain && features.terrain.geologyType) available++;
    
    return Math.round((available / total) * 100);
  }

  _getRecommendedAction(riskLevel, probability) {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'Immediate field inspection. Prepare evacuation support. Alert all nearby communities.';
      case 'HIGH':
        return 'Deploy field teams for inspection. Notify authorities and communities. Monitor continuously.';
      case 'ELEVATED':
        return 'Increase monitoring frequency. Prepare field teams. Issue advisory to local authorities.';
      case 'MODERATE':
        return 'Continue routine monitoring. Track rainfall and soil moisture trends.';
      case 'LOW':
      default:
        return 'Normal monitoring. No immediate action required.';
    }
  }

  /**
   * Gather all available features for a zone from various services
   */
  async _gatherFeatures(zone, rainfallService, soilMoistureService, terrainService) {
    const features = {};
    
    try {
      if (rainfallService) {
        features.rainfall = await rainfallService.getLatestForZone(zone._id);
      }
    } catch (e) { /* feature unavailable */ }

    try {
      if (soilMoistureService) {
        features.soilMoisture = await soilMoistureService.getLatestForZone(zone._id);
      }
    } catch (e) { /* feature unavailable */ }

    try {
      if (terrainService) {
        features.terrain = await terrainService.getForZone(zone._id);
      }
    } catch (e) { /* feature unavailable */ }

    // Use zone's stored terrain if service unavailable
    if (!features.terrain && zone.terrain) {
      features.terrain = {
        slope: zone.terrain.avgSlope,
        elevation: zone.terrain.avgElevation,
        aspect: zone.terrain.aspect,
        geologyType: zone.terrain.geologyType,
        landCoverType: zone.terrain.landCoverType
      };
    }

    return features;
  }
}

exports.RiskEngine = RiskEngine;
const riskEngine = exports.riskEngine = new RiskEngine();
