"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _sensorController = require("../controllers/sensorController");

const router = (0, _express.Router)();

router.get('/', _sensorController.getAllSensors);
router.get('/:sensorId/readings', _sensorController.getSensorReadings);

var _default = exports.default = router;
