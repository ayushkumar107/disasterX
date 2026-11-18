"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveWarnings = getActiveWarnings;
exports.getWarningById = getWarningById;
exports.getWarningsForZone = getWarningsForZone;
exports.cancelWarning = cancelWarning;

var _EarlyWarningService = require("../services/landslide/EarlyWarningService");
var _logger = require("../utils/logger");

async function getActiveWarnings(req, res) {
  try {
    const warnings = await _EarlyWarningService.earlyWarningService.getActiveWarnings();
    res.json({ success: true, data: warnings, count: warnings.length });
  } catch (error) {
    _logger.logger.error({ error }, 'Get warnings failed');
    res.status(500).json({ success: false, error: 'Failed to fetch warnings' });
  }
}

async function getWarningById(req, res) {
  try {
    const warning = await _EarlyWarningService.earlyWarningService.getWarningById(req.params.id);
    if (!warning) return res.status(404).json({ success: false, error: 'Warning not found' });
    res.json({ success: true, data: warning });
  } catch (error) {
    _logger.logger.error({ error }, 'Get warning failed');
    res.status(500).json({ success: false, error: 'Failed to fetch warning' });
  }
}

async function getWarningsForZone(req, res) {
  try {
    const warnings = await _EarlyWarningService.earlyWarningService.getWarningsForZone(req.params.zoneId);
    res.json({ success: true, data: warnings });
  } catch (error) {
    _logger.logger.error({ error }, 'Get zone warnings failed');
    res.status(500).json({ success: false, error: 'Failed to fetch zone warnings' });
  }
}

async function cancelWarning(req, res) {
  try {
    const warning = await _EarlyWarningService.earlyWarningService.cancelWarning(req.params.id, req.user._id);
    if (!warning) return res.status(404).json({ success: false, error: 'Warning not found' });
    res.json({ success: true, data: warning });
  } catch (error) {
    _logger.logger.error({ error }, 'Cancel warning failed');
    res.status(500).json({ success: false, error: 'Failed to cancel warning' });
  }
}
