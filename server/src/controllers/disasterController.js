"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disasterController = exports.DisasterController = void 0;
var _disasterService = require("../services/disasterService");
class DisasterController {
  async getDisasters(req, res, next) {
    try {
      const result = await _disasterService.disasterService.getDisasters(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async getDisasterById(req, res, next) {
    try {
      const disaster = await _disasterService.disasterService.getDisasterById(req.params.id);
      res.json(disaster);
    } catch (error) {
      next(error);
    }
  }
  async getNearbyDisasters(req, res, next) {
    try {
      const {
        lat,
        lng,
        radius
      } = req.query;
      const disasters = await _disasterService.disasterService.getNearbyDisasters(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 100);
      res.json(disasters);
    } catch (error) {
      next(error);
    }
  }
  async createDisaster(req, res, next) {
    try {
      const disaster = await _disasterService.disasterService.createDisaster({
        ...req.body,
        source: 'ADMIN',
        startDate: new Date(),
        confidence: 100
      });
      res.status(201).json(disaster);
    } catch (error) {
      next(error);
    }
  }
  async updateDisaster(req, res, next) {
    try {
      const disaster = await _disasterService.disasterService.updateDisaster(req.params.id, req.body);
      res.json(disaster);
    } catch (error) {
      next(error);
    }
  }
  async createReport(req, res, next) {
    try {
      const { DisasterReport } = require('../models/DisasterReport');
      const { reportCredibilityService } = require('../services/landslide/ReportCredibilityService');
      const { LandslideRiskZone } = require('../models/LandslideRiskZone');
      const { riskEngine } = require('../services/landslide/RiskEngine');
      const { rainfallService } = require('../services/landslide/RainfallService');
      const { soilMoistureService } = require('../services/landslide/SoilMoistureService');

      const report = await DisasterReport.create({
        ...req.body,
        reporter: req.user._id
      });

      // Calculate credibility and status update
      await reportCredibilityService.updateReportCredibility(report._id);

      // If it is a verified landslide report, update citizen reports indicator and run risk engine evaluation
      if (req.body.type === 'LANDSLIDE') {
        const coords = req.body.location.coordinates;
        // Find nearest risk zone within 10km
        const nearestZone = await LandslideRiskZone.findOne({
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: coords
              },
              $maxDistance: 10 * 1000 // 10km
            }
          }
        });

        if (nearestZone) {
          nearestZone.riskDrivers = nearestZone.riskDrivers || {};
          nearestZone.riskDrivers.citizenReports = (nearestZone.riskDrivers.citizenReports || 0) + 10;
          await nearestZone.save();

          // Evaluate risk zone
          await riskEngine.evaluateAllZones(rainfallService, soilMoistureService, null);
        }
      }

      res.status(201).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
  async getReports(req, res, next) {
    try {
      const { DisasterReport } = require('../models/DisasterReport');
      const reports = await DisasterReport.find()
        .populate('reporter', 'name email role')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  }
  async getStats(req, res, next) {
    try {
      const stats = await _disasterService.disasterService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
exports.DisasterController = DisasterController;
const disasterController = exports.disasterController = new DisasterController();