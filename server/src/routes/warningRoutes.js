"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _warningController = require("../controllers/warningController");
var _auth = require("../middleware/auth");

const router = (0, _express.Router)();

router.get('/', _warningController.getActiveWarnings);
router.get('/:id', _warningController.getWarningById);
router.get('/zone/:zoneId', _warningController.getWarningsForZone);
router.post('/:id/cancel', _auth.authenticate, _warningController.cancelWarning);

var _default = exports.default = router;
