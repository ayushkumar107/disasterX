"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _disasterController = require("../controllers/disasterController");
var _auth = require("../middleware/auth");
var _rbac = require("../middleware/rbac");
var _validate = require("../middleware/validate");
var _disasterValidators = require("../validators/disasterValidators");
const router = (0, _express.Router)();
router.get('/', (req, res, next) => _disasterController.disasterController.getDisasters(req, res, next));
router.get('/stats', (req, res, next) => _disasterController.disasterController.getStats(req, res, next));
router.get('/nearby', _auth.authenticate, (req, res, next) => _disasterController.disasterController.getNearbyDisasters(req, res, next));
router.get('/:id', (req, res, next) => _disasterController.disasterController.getDisasterById(req, res, next));
router.post('/', _auth.authenticate, (0, _rbac.requireRole)('ADMIN'), (0, _validate.validate)(_disasterValidators.createDisasterSchema), (req, res, next) => _disasterController.disasterController.createDisaster(req, res, next));
router.patch('/:id', _auth.authenticate, (0, _rbac.requireRole)('ADMIN'), (req, res, next) => _disasterController.disasterController.updateDisaster(req, res, next));
var _default = exports.default = router;