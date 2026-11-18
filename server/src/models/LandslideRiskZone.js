"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LandslideRiskZone = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const landslideRiskZoneSchema = new _mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    enum: ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'],
    required: true
  },
  district: String,
  // Center point for quick lookups
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
  // Polygon boundary for the zone
  boundary: {
    type: {
      type: String,
      enum: ['Polygon']
    },
    coordinates: {
      type: [[[Number]]]
    }
  },
  // Current risk assessment
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  probability: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Explainable AI — feature contributions
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
  // Terrain characteristics
  terrain: {
    avgSlope: Number,         // degrees
    maxSlope: Number,
    avgElevation: Number,     // meters
    aspect: String,           // N, NE, E, SE, S, SW, W, NW
    geologyType: String,
    landCoverType: String,
    soilType: String
  },
  // Environmental conditions
  currentConditions: {
    rainfall24h: Number,       // mm
    rainfall72h: Number,       // mm
    rainfallIntensity: String, // LOW, MODERATE, HIGH, EXTREME
    soilMoisture: Number,      // percentage
    soilMoistureTrend: String  // STABLE, INCREASING, RAPIDLY_INCREASING, DECREASING
  },
  // Affected infrastructure
  affectedVillages: [{
    name: String,
    population: Number,
    distance: Number   // km from zone center
  }],
  affectedRoads: [{
    name: String,
    roadType: {
      type: String,
      enum: ['NATIONAL_HIGHWAY', 'STATE_HIGHWAY', 'DISTRICT_ROAD', 'LOCAL_ROAD', 'BRIDGE']
    },
    riskStatus: {
      type: String,
      enum: ['SAFE', 'AT_RISK', 'BLOCKED', 'UNKNOWN'],
      default: 'UNKNOWN'
    }
  }],
  criticalInfrastructure: [{
    name: String,
    infraType: {
      type: String
    },
    distance: Number
  }],
  // Assessment metadata
  lastAssessment: {
    type: Date,
    default: Date.now
  },
  assessmentModel: {
    type: String,
    default: 'PROTOTYPE_V1'
  },
  dataSource: {
    type: String,
    enum: ['LIVE', 'SIMULATED', 'HISTORICAL', 'DEMO'],
    default: 'SIMULATED'
  },
  // Active warning reference
  activeWarning: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'EarlyWarning'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MONITORING', 'RESOLVED', 'INACTIVE'],
    default: 'MONITORING'
  }
}, {
  timestamps: true
});

landslideRiskZoneSchema.index({ location: '2dsphere' });
landslideRiskZoneSchema.index({ boundary: '2dsphere' });
landslideRiskZoneSchema.index({ state: 1 });
landslideRiskZoneSchema.index({ riskLevel: 1 });
landslideRiskZoneSchema.index({ status: 1 });
landslideRiskZoneSchema.index({ zoneId: 1 }, { unique: true });

const LandslideRiskZone = exports.LandslideRiskZone = _mongoose.default.model('LandslideRiskZone', landslideRiskZoneSchema);
