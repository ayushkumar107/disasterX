"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockSensorAdapter = void 0;

/**
 * Mock Soil Moisture Sensor Adapter
 * Simulates live sensor readings for testing.
 */
class MockSensorAdapter {
  constructor() {
    this.providerName = 'MOCK_IOT_GATEWAY';
    this.dataSource = 'SIMULATED';
  }

  async getReading(sensorId) {
    // Basic fluctuation around a stable or trending value
    // Let's generate a reading between 20% and 95%
    const hour = new Date().getHours();
    
    // Simulate natural daily temperature cycle
    const baseTemp = 22 + Math.sin((hour - 6) * Math.PI / 12) * 5;
    const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 2) * 10) / 10;

    // Default moisture ranges
    let baseMoisture = 45;
    if (sensorId.includes('-AS-')) baseMoisture = 72; // Haflong
    if (sensorId.includes('-AR-')) baseMoisture = 86; // Itanagar (high)
    if (sensorId.includes('-ML-')) baseMoisture = 78; // Cherrapunji
    if (sensorId.includes('-SK-')) baseMoisture = 82; // Gangtok (high)

    // Add diurnal/noise fluctuation
    const fluctuation = (Math.random() - 0.4) * 3; // slight upward drift bias
    const moisture = Math.max(10, Math.min(98, baseMoisture + fluctuation));

    return {
      moisture: Math.round(moisture * 10) / 10,
      temperature,
      dataSource: 'SIMULATED'
    };
  }
}

exports.MockSensorAdapter = MockSensorAdapter;
