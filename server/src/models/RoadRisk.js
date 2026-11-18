"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoadRisk = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const roadRiskSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  roadType: {
    type: String,
    enum: ['NATIONAL_HIGHWAY', 'STATE_HIGHWAY', 'DISTRICT_ROAD', 'LOCAL_ROAD', 'BRIDGE'],
    required: true
  },
  roadNumber: String,        // e.g., 'NH-44', 'SH-1'
  state: {
    type: String,
    enum: ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'],
    required: true
  },
  district: String,
  // Road geometry
  startPoint: {
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
  endPoint: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  // Route line
  route: {
    type: {
      type: String,
      enum: ['LineString']
    },
    coordinates: [[Number]]
  },
  // Risk status
  riskStatus: {
    type: String,
    enum: ['SAFE', 'AT_RISK', 'BLOCKED', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Why this road is at risk
  riskFactors: [{
    factor: String,       // 'adjacent_slope_risk', 'historical_blockage', 'rainfall', etc.
    description: String,
    contribution: Number  // 0-100
  }],
  // Nearby risk zones
  nearbyRiskZones: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  }],
  // Connectivity info
  connectsVillages: [String],
  alternateRouteAvailable: {
    type: Boolean,
    default: false
  },
  alternateRouteDescription: String,
  // Blockage info
  lastBlockage: {
    date: Date,
    duration: Number,    // hours
    cause: String
  },
  // Length in km
  lengthKm: Number,
  // Traffic importance
  importance: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

roadRiskSchema.index({ startPoint: '2dsphere' });
roadRiskSchema.index({ state: 1 });
roadRiskSchema.index({ riskStatus: 1 });
roadRiskSchema.index({ importance: 1 });

const RoadRisk = exports.RoadRisk = _mongoose.default.model('RoadRisk', roadRiskSchema);
