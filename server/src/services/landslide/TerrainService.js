"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.terrainService = exports.TerrainService = void 0;
var _TerrainFeature = require("../../models/TerrainFeature");
var _logger = require("../../utils/logger");

class TerrainService {
  /**
   * Get terrain features for a zone
   */
  async getForZone(zoneId) {
    const feature = await _TerrainFeature.TerrainFeature.findOne({ riskZone: zoneId }).lean();
    if (!feature) return null;

    return {
      slope: feature.slope,
      elevation: feature.elevation,
      aspect: feature.aspect,
      geologyType: feature.geologyType,
      landCoverType: feature.landCoverType,
      slopeClass: feature.slopeClass,
      susceptibilityScore: feature.susceptibilityScore,
      susceptibility: feature.susceptibility
    };
  }

  /**
   * Get all terrain features (DEM maps)
   */
  async getAll() {
    return _TerrainFeature.TerrainFeature.find().lean();
  }
}

exports.TerrainService = TerrainService;
const terrainService = exports.terrainService = new TerrainService();
