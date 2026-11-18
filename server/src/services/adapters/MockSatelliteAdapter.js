"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockSatelliteAdapter = void 0;

/**
 * Mock Satellite Change Detection Adapter
 * Simulates SAR/Optical imagery difference analysis for slope deformation.
 */
class MockSatelliteAdapter {
  constructor() {
    this.providerName = 'ISRO_BHOOVAN_MOCK';
    this.dataSource = 'SIMULATED';
  }

  async detectChanges(lat, lng) {
    // Return mock deformation change detection result
    const changeDetected = Math.random() > 0.6; // 40% chance of detecting some change
    if (!changeDetected) {
      return {
        changeDetected: false,
        changeType: 'NONE',
        changeMagnitude: 0,
        changeConfidence: 95,
        changeDescription: 'No significant surface deformation or vegetation loss detected.'
      };
    }

    const types = ['DEFORMATION', 'VEGETATION_LOSS', 'SURFACE_CHANGE', 'SLOPE_FAILURE'];
    const changeType = types[Math.floor(Math.random() * types.length)];
    const changeMagnitude = Math.round(30 + Math.random() * 55); // 30% - 85% magnitude
    const changeConfidence = Math.round(60 + Math.random() * 35); // 60% - 95% confidence

    return {
      changeDetected: true,
      changeType,
      changeMagnitude,
      changeConfidence,
      changeDescription: `Significant ${changeType.toLowerCase().replace('_', ' ')} detected on adjacent hillslope via Sentinel-2 optical and SAR difference analysis.`,
      imageT1Date: new Date(Date.now() - 7 * 24 * 3600000),
      imageT2Date: new Date(),
      resolution: '10m'
    };
  }
}

exports.MockSatelliteAdapter = MockSatelliteAdapter;
