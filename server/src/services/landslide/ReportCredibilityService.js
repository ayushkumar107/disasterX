"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reportCredibilityService = exports.ReportCredibilityService = void 0;
var _DisasterReport = require("../../models/DisasterReport");
var _logger = require("../../utils/logger");

class ReportCredibilityService {
  /**
   * Calculate credibility score of a field report (0-100)
   * @param {Object} report - The DisasterReport document
   * @param {Object} reporter - The User document of the reporter
   */
  async calculateCredibility(report, reporter) {
    let score = 50; // base score

    // 1. Role weights
    if (reporter) {
      if (reporter.role === 'ADMIN') score += 40;
      else if (reporter.role === 'RESCUE_TEAM') score += 35;
      else if (reporter.role === 'VOLUNTEER') score += 20;
      else if (reporter.role === 'USER') score += 5;
    }

    // 2. Verification weight
    const verificationCount = (report.verifications || []).length;
    score += verificationCount * 10;

    // 3. Media evidence weight
    if (report.images && report.images.length > 0) {
      score += 15;
    }

    // 4. Landslide observation detail detail level
    if (report.landslideObservations) {
      const obs = report.landslideObservations;
      let checkCount = 0;
      if (obs.groundCracks) checkCount++;
      if (obs.tiltedTreesOrPoles) checkCount++;
      if (obs.soilMovement) checkCount++;
      if (obs.roadBlockage) checkCount++;
      if (obs.waterSeepage) checkCount++;
      if (obs.bouldersRolling) checkCount++;

      score += checkCount * 5; // up to 30 points
    }

    // Clamp score
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Recalculate credibility score of a report and save it
   */
  async updateReportCredibility(reportId) {
    const report = await _DisasterReport.DisasterReport.findById(reportId).populate('reporter');
    if (!report) return null;

    const newScore = await this.calculateCredibility(report, report.reporter);
    report.credibilityScore = newScore;
    
    if (newScore >= 75) {
      report.status = 'VERIFIED';
    }

    await report.save();
    return newScore;
  }
}

exports.ReportCredibilityService = ReportCredibilityService;
const reportCredibilityService = exports.reportCredibilityService = new ReportCredibilityService();
