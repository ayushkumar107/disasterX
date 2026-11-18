"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SoilMoistureSensor = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const soilMoistureSensorSchema = new _mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  state: {
    type: String,
    enum: ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim']
  },
  district: String,
  // Threshold configuration
  thresholdWarning: {
    type: Number,
    default: 70   // percentage
  },
  thresholdCritical: {
    type: Number,
    default: 85   // percentage
  },
  // Current state
  currentMoisture: {
    type: Number,
    default: 0
  },
  currentStatus: {
    type: String,
    enum: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE', 'ERROR'],
    default: 'NORMAL'
  },
  lastReading: Date,
  // Trend
  trend: {
    type: String,
    enum: ['STABLE', 'INCREASING', 'RAPIDLY_INCREASING', 'DECREASING'],
    default: 'STABLE'
  },
  // Recent readings for quick trend display
  recentReadings: [{
    value: Number,
    timestamp: Date
  }],
  // Sensor metadata
  depth: Number,           // cm below surface
  installDate: Date,
  batteryLevel: Number,    // percentage
  // Associated risk zone
  riskZone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  },
  // Data provenance
  provider: {
    type: String,
    default: 'SIMULATOR'   // 'MQTT', 'API', 'SIMULATOR'
  },
  dataSource: {
    type: String,
    enum: ['REAL', 'SIMULATED'],
    default: 'SIMULATED'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

soilMoistureSensorSchema.index({ location: '2dsphere' });
soilMoistureSensorSchema.index({ sensorId: 1 }, { unique: true });
soilMoistureSensorSchema.index({ state: 1 });
soilMoistureSensorSchema.index({ currentStatus: 1 });
soilMoistureSensorSchema.index({ riskZone: 1 });

const SoilMoistureSensor = exports.SoilMoistureSensor = _mongoose.default.model('SoilMoistureSensor', soilMoistureSensorSchema);
