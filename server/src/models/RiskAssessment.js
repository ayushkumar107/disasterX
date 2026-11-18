"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RiskAssessment = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const riskAssessmentSchema = new _mongoose.Schema({
  zone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone',
    required: true
  },
  // Input features
  features: {
    rainfall: {
      current: Number,           // mm/hr
      rainfall1h: Number,        // mm
      rainfall6h: Number,        // mm
      rainfall24h: Number,       // mm
      rainfall72h: Number,       // mm
      historicalAvg: Number,     // mm (for this period)
      anomaly: Number,           // percentage above/below average
      forecastRainfall: Number,  // mm expected next 24h
      intensity: {
        type: String,
        enum: ['NONE', 'LIGHT', 'MODERATE', 'HEAVY', 'VERY_HEAVY', 'EXTREME']
      }
    },
    soilMoisture: {
      current: Number,           // percentage
      trend: {
        type: String,
        enum: ['STABLE', 'INCREASING', 'RAPIDLY_INCREASING', 'DECREASING']
      },
      saturationLevel: {
        type: String,
        enum: ['DRY', 'NORMAL', 'WET', 'VERY_WET', 'SATURATED']
      },
      readings: [Number]         // recent time-series values
    },
    terrain: {
      slope: Number,             // degrees
      elevation: Number,         // meters
      aspect: String,
      geologyType: String,
      landCoverType: String,
      terrainRoughness: Number
    },
    historical: {
      previousEvents: Number,    // count within radius
      lastEventDate: Date,
      susceptibilityScore: Number, // 0-100
      recurrenceInterval: Number   // years
    },
    satellite: {
      changeDetected: Boolean,
      changeType: String,         // DEFORMATION, VEGETATION_LOSS, SURFACE_CHANGE
      changeMagnitude: Number,    // 0-100
      observationDate: Date
    },
    citizenReports: {
      reportCount: Number,
      avgCredibility: Number,
      indicators: [String]        // GROUND_CRACK, SLOPE_MOVEMENT, etc.
    }
  },
  // Output
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  // Explainable AI contributions (how much each feature contributed)
  riskDrivers: {
    rainfall: { type: Number, default: 0 },
    soilMoisture: { type: Number, default: 0 },
    slope: { type: Number, default: 0 },
    historicalSusceptibility: { type: Number, default: 0 },
    satelliteChange: { type: Number, default: 0 },
    citizenReports: { type: Number, default: 0 },
    elevation: { type: Number, default: 0 },
    landCover: { type: Number, default: 0 },
    geology: { type: Number, default: 0 }
  },
  // Model metadata
  modelType: {
    type: String,
    enum: ['PROTOTYPE', 'TRAINED_ML'],
    default: 'PROTOTYPE'
  },
  modelVersion: {
    type: String,
    default: 'prototype-v1'
  },
  processingTime: Number,   // ms
  // Recommended action
  recommendedAction: String,
  // Data source status
  dataCompleteness: {
    type: Number,      // 0-100 percentage of features with real data
    default: 0
  }
}, {
  timestamps: true
});

riskAssessmentSchema.index({ zone: 1, createdAt: -1 });
riskAssessmentSchema.index({ riskLevel: 1 });
riskAssessmentSchema.index({ createdAt: -1 });

const RiskAssessment = exports.RiskAssessment = _mongoose.default.model('RiskAssessment', riskAssessmentSchema);
