"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.env = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_dotenv.default.config({
  path: _path.default.resolve(__dirname, '../../.env')
});
const env = exports.env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.SERVER_PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/disasterx',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  USE_MOCK_DATA: process.env.USE_MOCK_DATA === 'true',
  REDIS_URL: process.env.REDIS_URL || '',
  OWM_API_KEY: process.env.OWM_API_KEY || '',
  USGS_API_URL: process.env.USGS_API_URL || 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary',
  EONET_API_URL: process.env.EONET_API_URL || 'https://eonet.gsfc.nasa.gov/api/v3',
  GDACS_API_URL: process.env.GDACS_API_URL || 'https://www.gdacs.org/gdacsapi/api',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  OSIRIS_API_URL: process.env.OSIRIS_API_URL || 'https://osirisai.live/api'
};