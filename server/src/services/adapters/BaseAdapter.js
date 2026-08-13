"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataAdapter = void 0;
var _logger = require("../../utils/logger");
var _axios = _interopRequireDefault(require("axios"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DataAdapter {
  constructor(sourceName, baseUrl) {
    this.sourceName = sourceName;
    this.baseUrl = baseUrl;
  }

  /**
   * Abstract method that must be implemented by all specific adapters.
   * Fetches data from the external API and normalizes it into our IDisaster format.
   */

  /**
   * Utility for making HTTP requests with basic error handling
   */
  async makeRequest(endpoint, params = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      const response = await _axios.default.get(url, {
        params
      });
      return response.data;
    } catch (error) {
      _logger.logger.error({
        msg: `Failed to fetch data from ${this.sourceName}`,
        endpoint,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Validates if a coordinate pair is valid [longitude, latitude]
   */
  isValidCoordinate(lng, lat) {
    return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180 && typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
  }
}
exports.DataAdapter = DataAdapter;
