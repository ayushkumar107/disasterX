"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRiskZones = getRiskZones;
exports.getRiskZoneById = getRiskZoneById;
exports.getAssessments = getAssessments;
exports.getLandslideStats = getLandslideStats;
exports.getHistoricalLandslides = getHistoricalLandslides;
exports.simulateScenario = simulateScenario;
exports.triggerEvaluation = triggerEvaluation;
exports.getRoadRisks = getRoadRisks;
exports.getTerrainFeatures = getTerrainFeatures;
exports.getPrioritySOS = getPrioritySOS;
exports.getPriorityZones = getPriorityZones;

var _LandslideRiskZone = require("../models/LandslideRiskZone");
var _RiskAssessment = require("../models/RiskAssessment");
var _HistoricalLandslide = require("../models/HistoricalLandslide");
var _RoadRisk = require("../models/RoadRisk");
var _TerrainFeature = require("../models/TerrainFeature");
var _RiskEngine = require("../services/landslide/RiskEngine");
var _RainfallService = require("../services/landslide/RainfallService");
var _SoilMoistureService = require("../services/landslide/SoilMoistureService");
var _ResponsePriorityService = require("../services/landslide/ResponsePriorityService");
var _logger = require("../utils/logger");

async function getRiskZones(req, res) {
  try {
    const { state, riskLevel, status = 'MONITORING' } = req.query;
    const filter = {};
    
    if (state) filter.state = state;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (status !== 'ALL') filter.status = { $in: status.split(',') };

    const zones = await _LandslideRiskZone.LandslideRiskZone.find(filter)
      .populate('activeWarning', 'warningLevel status issuedAt validUntil')
      .sort({ probability: -1 })
      .lean();

    res.json({ success: true, data: zones, count: zones.length });
  } catch (error) {
    _logger.logger.error({ error }, 'Get risk zones failed');
    res.status(500).json({ success: false, error: 'Failed to fetch risk zones' });
  }
}

async function getRiskZoneById(req, res) {
  try {
    const zone = await _LandslideRiskZone.LandslideRiskZone.findById(req.params.id)
      .populate('activeWarning')
      .lean();
    
    if (!zone) return res.status(404).json({ success: false, error: 'Zone not found' });
    res.json({ success: true, data: zone });
  } catch (error) {
    _logger.logger.error({ error }, 'Get risk zone failed');
    res.status(500).json({ success: false, error: 'Failed to fetch risk zone' });
  }
}

async function getAssessments(req, res) {
  try {
    const { limit = 20 } = req.query;
    const assessments = await _RiskAssessment.RiskAssessment.find({ zone: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: assessments });
  } catch (error) {
    _logger.logger.error({ error }, 'Get assessments failed');
    res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
  }
}

async function getLandslideStats(req, res) {
  try {
    const zones = await _LandslideRiskZone.LandslideRiskZone.find({
      status: { $in: ['ACTIVE', 'MONITORING'] }
    }).lean();

    const stats = {
      totalZones: zones.length,
      byRiskLevel: {},
      byState: {},
      avgProbability: 0,
      highRiskCount: 0,
      criticalCount: 0
    };

    for (const zone of zones) {
      // By risk level
      stats.byRiskLevel[zone.riskLevel] = (stats.byRiskLevel[zone.riskLevel] || 0) + 1;
      // By state
      stats.byState[zone.state] = (stats.byState[zone.state] || 0) + 1;
      // Aggregates
      stats.avgProbability += zone.probability || 0;
      if (zone.riskLevel === 'HIGH') stats.highRiskCount++;
      if (zone.riskLevel === 'CRITICAL') stats.criticalCount++;
    }

    stats.avgProbability = zones.length > 0 ? Math.round(stats.avgProbability / zones.length) : 0;

    res.json({ success: true, data: stats });
  } catch (error) {
    _logger.logger.error({ error }, 'Get landslide stats failed');
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
}

async function getHistoricalLandslides(req, res) {
  try {
    const { state, severity, limit = 50 } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (severity) filter.severity = severity;

    const events = await _HistoricalLandslide.HistoricalLandslide.find(filter)
      .sort({ eventDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data: events, count: events.length });
  } catch (error) {
    _logger.logger.error({ error }, 'Get historical landslides failed');
    res.status(500).json({ success: false, error: 'Failed to fetch historical data' });
  }
}

async function simulateScenario(req, res) {
  try {
    const zone = await _LandslideRiskZone.LandslideRiskZone.findById(req.params.id).lean();
    if (!zone) return res.status(404).json({ success: false, error: 'Zone not found' });

    // Get current features from zone terrain
    const baseFeatures = {
      rainfall: zone.currentConditions ? {
        rainfall24h: zone.currentConditions.rainfall24h,
        rainfall72h: zone.currentConditions.rainfall72h,
        currentRainfall: zone.currentConditions.rainfall24h ? zone.currentConditions.rainfall24h / 24 : 0,
        intensity: zone.currentConditions.rainfallIntensity
      } : {},
      soilMoisture: zone.currentConditions ? {
        current: zone.currentConditions.soilMoisture,
        trend: zone.currentConditions.soilMoistureTrend
      } : {},
      terrain: zone.terrain ? {
        slope: zone.terrain.avgSlope,
        elevation: zone.terrain.avgElevation,
        aspect: zone.terrain.aspect,
        geologyType: zone.terrain.geologyType,
        landCoverType: zone.terrain.landCoverType
      } : {}
    };

    const result = _RiskEngine.riskEngine.simulateScenario(baseFeatures, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    _logger.logger.error({ error }, 'Simulation failed');
    res.status(500).json({ success: false, error: 'Simulation failed' });
  }
}

async function triggerEvaluation(req, res) {
  try {
    const result = await _RiskEngine.riskEngine.evaluateAllZones(
      _RainfallService.rainfallService,
      _SoilMoistureService.soilMoistureService,
      null
    );
    res.json({ success: true, data: result });
  } catch (error) {
    _logger.logger.error({ error }, 'Evaluation trigger failed');
    res.status(500).json({ success: false, error: 'Evaluation failed' });
  }
}

async function getRoadRisks(req, res) {
  try {
    const roads = await _RoadRisk.RoadRisk.find().lean();
    res.json({ success: true, data: roads });
  } catch (error) {
    _logger.logger.error({ error }, 'Get road risks failed');
    res.status(500).json({ success: false, error: 'Failed to fetch road risks' });
  }
}

async function getTerrainFeatures(req, res) {
  try {
    const terrain = await _TerrainFeature.TerrainFeature.find().lean();
    res.json({ success: true, data: terrain });
  } catch (error) {
    _logger.logger.error({ error }, 'Get terrain features failed');
    res.status(500).json({ success: false, error: 'Failed to fetch terrain features' });
  }
}

async function getPrioritySOS(req, res) {
  try {
    const queue = await _ResponsePriorityService.responsePriorityService.getPrioritySOSQueue();
    res.json({ success: true, data: queue });
  } catch (error) {
    _logger.logger.error({ error }, 'Get priority SOS failed');
    res.status(500).json({ success: false, error: 'Failed to fetch priority SOS queue' });
  }
}

async function getPriorityZones(req, res) {
  try {
    const queue = await _ResponsePriorityService.responsePriorityService.getRiskZonePriorityQueue();
    res.json({ success: true, data: queue });
  } catch (error) {
    _logger.logger.error({ error }, 'Get priority zones failed');
    res.status(500).json({ success: false, error: 'Failed to fetch priority zones queue' });
  }
}
