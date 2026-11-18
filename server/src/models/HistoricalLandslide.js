"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HistoricalLandslide = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const historicalLandslideSchema = new _mongoose.Schema({
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
    enum: ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'],
    required: true
  },
  district: String,
  eventDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  // Severity and impact
  severity: {
    type: String,
    enum: ['MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC'],
    required: true
  },
  landslideType: {
    type: String,
    enum: ['ROCKFALL', 'DEBRIS_FLOW', 'MUDSLIDE', 'ROTATIONAL', 'TRANSLATIONAL', 'COMPLEX', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  // Affected areas
  affectedVillages: [String],
  affectedRoads: [String],
  // Casualties/damage (only if officially reported)
  casualties: {
    fatalities: Number,
    injured: Number,
    missing: Number,
    displaced: Number
  },
  damage: {
    housesDestroyed: Number,
    housesDamaged: Number,
    roadsBlocked: Number,
    bridgesDamaged: Number,
    estimatedLossINR: Number    // Indian Rupees
  },
  // Conditions at time of event
  conditions: {
    rainfall24h: Number,        // mm
    rainfall72h: Number,        // mm
    antecedentRainfall: Number, // mm in previous week
    soilCondition: String
  },
  // Source and reliability
  source: {
    type: String,
    required: true    // 'GSI', 'NDMA', 'NEWS', 'RESEARCH_PAPER', 'SDMA'
  },
  sourceUrl: String,
  sourceReliability: {
    type: String,
    enum: ['OFFICIAL', 'SEMI_OFFICIAL', 'MEDIA', 'UNVERIFIED'],
    default: 'SEMI_OFFICIAL'
  },
  // Associated risk zone
  riskZone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  },
  // Used for susceptibility calculation
  usedInSusceptibility: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

historicalLandslideSchema.index({ location: '2dsphere' });
historicalLandslideSchema.index({ state: 1 });
historicalLandslideSchema.index({ eventDate: -1 });
historicalLandslideSchema.index({ severity: 1 });
historicalLandslideSchema.index({ riskZone: 1 });

const HistoricalLandslide = exports.HistoricalLandslide = _mongoose.default.model('HistoricalLandslide', historicalLandslideSchema);
