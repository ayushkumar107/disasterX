"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _landslideController = require("../controllers/landslideController");
var _auth = require("../middleware/auth");

const router = (0, _express.Router)();

// Public endpoints
router.get('/zones', _landslideController.getRiskZones);
router.get('/zones/:id', _landslideController.getRiskZoneById);
router.get('/zones/:id/assessments', _landslideController.getAssessments);
router.get('/stats', _landslideController.getLandslideStats);
router.get('/historical', _landslideController.getHistoricalLandslides);
router.get('/roads', _landslideController.getRoadRisks);
router.get('/terrain', _landslideController.getTerrainFeatures);

// Protected endpoints
router.post('/zones/:id/simulate', _auth.authenticate, _landslideController.simulateScenario);
router.get('/priority/sos', _auth.authenticate, _landslideController.getPrioritySOS);
router.get('/priority/zones', _auth.authenticate, _landslideController.getPriorityZones);

// Admin endpoints
router.post('/evaluate', _auth.authenticate, _landslideController.triggerEvaluation);

var _default = exports.default = router;
