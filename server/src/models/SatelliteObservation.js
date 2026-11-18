"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SatelliteObservation = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const satelliteObservationSchema = new _mongoose.Schema({
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
  // Image pair for change detection
  imageT1: {
    date: Date,
    source: String,     // 'Sentinel-2', 'Landsat', etc.
    resolution: String  // e.g., '10m'
  },
  imageT2: {
    date: Date,
    source: String,
    resolution: String
  },
  // Change detection results
  changeDetected: {
    type: Boolean,
    default: false
  },
  changeType: {
    type: String,
    enum: ['NONE', 'DEFORMATION', 'VEGETATION_LOSS', 'SURFACE_CHANGE', 'SLOPE_FAILURE', 'WATER_ACCUMULATION'],
    default: 'NONE'
  },
  changeMagnitude: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  changeConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  changeDescription: String,
  // Area affected
  affectedArea: Number,    // sq km
  // Risk adjustment
  riskAdjustment: {
    type: Number,
    default: 0    // additional risk score contribution
  },
  // Associated risk zone
  riskZone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  },
  // Data provenance
  provider: {
    type: String,
    default: 'MOCK'   // 'SENTINEL', 'LANDSAT', 'ISRO', 'MOCK'
  },
  dataSource: {
    type: String,
    enum: ['LIVE', 'SIMULATED', 'DEMO'],
    default: 'SIMULATED'
  },
  status: {
    type: String,
    enum: ['PENDING', 'ANALYZED', 'VERIFIED', 'DISMISSED'],
    default: 'ANALYZED'
  },
  observedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

satelliteObservationSchema.index({ location: '2dsphere' });
satelliteObservationSchema.index({ changeDetected: 1 });
satelliteObservationSchema.index({ riskZone: 1 });
satelliteObservationSchema.index({ observedAt: -1 });

const SatelliteObservation = exports.SatelliteObservation = _mongoose.default.model('SatelliteObservation', satelliteObservationSchema);
