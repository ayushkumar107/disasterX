"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RainfallObservation = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const rainfallObservationSchema = new _mongoose.Schema({
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
  stationName: String,
  // Current readings
  currentRainfall: Number,      // mm/hr
  temperature: Number,          // °C
  humidity: Number,             // percentage
  // Cumulative rainfall
  rainfall1h: Number,           // mm
  rainfall6h: Number,           // mm
  rainfall24h: Number,          // mm
  rainfall72h: Number,          // mm
  // Historical comparison
  historicalAverage: Number,    // mm (for this day of year)
  anomaly: Number,              // percentage deviation from average
  // Forecast
  forecastRainfall24h: Number,  // mm expected in next 24h
  forecastRainfall48h: Number,  // mm expected in next 48h
  forecastAccumulation: Number, // total expected mm
  // Intensity classification
  intensity: {
    type: String,
    enum: ['NONE', 'LIGHT', 'MODERATE', 'HEAVY', 'VERY_HEAVY', 'EXTREME'],
    default: 'NONE'
  },
  // Risk contribution
  rainfallRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Associated risk zone
  riskZone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  },
  // Data provenance
  provider: {
    type: String,
    required: true    // 'OPEN_METEO', 'IMD', 'MOCK'
  },
  dataSource: {
    type: String,
    enum: ['LIVE', 'SIMULATED', 'HISTORICAL', 'DEMO'],
    default: 'SIMULATED'
  },
  observedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

rainfallObservationSchema.index({ location: '2dsphere' });
rainfallObservationSchema.index({ state: 1 });
rainfallObservationSchema.index({ riskZone: 1 });
rainfallObservationSchema.index({ observedAt: -1 });
rainfallObservationSchema.index({ intensity: 1 });

const RainfallObservation = exports.RainfallObservation = _mongoose.default.model('RainfallObservation', rainfallObservationSchema);
