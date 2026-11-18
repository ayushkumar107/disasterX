"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ingestionService = exports.IngestionService = void 0;
var _USGSAdapter = require("./adapters/USGSAdapter");
var _EONETAdapter = require("./adapters/EONETAdapter");
var _GDACSAdapter = require("./adapters/GDACSAdapter");
var _OsirisWeatherAdapter = require("./adapters/OsirisWeatherAdapter");
var _OsirisEarthquakeAdapter = require("./adapters/OsirisEarthquakeAdapter");
var _OsirisHazardsAdapter = require("./adapters/OsirisHazardsAdapter");
var _Disaster = require("../models/Disaster");
var _logger = require("../utils/logger");
class IngestionService {
  adapters = [new _USGSAdapter.USGSAdapter(), new _EONETAdapter.EONETAdapter(), new _GDACSAdapter.GDACSAdapter(), new _OsirisWeatherAdapter.OsirisWeatherAdapter(), new _OsirisEarthquakeAdapter.OsirisEarthquakeAdapter(), new _OsirisHazardsAdapter.OsirisHazardsAdapter()];
  async runIngestion() {
    _logger.logger.info('🔄 Starting global disaster data ingestion...');
    const startTime = Date.now();
    let totalInserted = 0;
    let totalUpdated = 0;
    for (const adapter of this.adapters) {
      try {
        const disasters = await adapter.fetchData();
        for (const disasterData of disasters) {
          if (!disasterData.externalId) continue;

          // Upsert disaster based on externalId
          // If it exists, update it, otherwise insert
          const result = await _Disaster.Disaster.updateOne({
            externalId: disasterData.externalId,
            source: disasterData.source
          }, {
            $set: disasterData
          }, {
            upsert: true
          });
          if (result.upsertedCount > 0) {
            totalInserted++;
          } else if (result.modifiedCount > 0) {
            totalUpdated++;
          }
        }
      } catch (error) {
        _logger.logger.error(`❌ Ingestion failed for an adapter: ${error.message}`);
      }
    }
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    _logger.logger.info(`✅ Ingestion complete in ${duration}s. Inserted: ${totalInserted}, Updated: ${totalUpdated}`);
  }
}
exports.IngestionService = IngestionService;
const ingestionService = exports.ingestionService = new IngestionService();