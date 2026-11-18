"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _rainfallController = require("../controllers/rainfallController");

const router = (0, _express.Router)();

router.get('/', _rainfallController.getRainfallData);
router.get('/zone/:zoneId', _rainfallController.getRainfallForZone);
router.get('/history/:zoneId', _rainfallController.getRainfallHistory);

var _default = exports.default = router;
