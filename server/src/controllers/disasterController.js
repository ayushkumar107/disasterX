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