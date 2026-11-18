"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EarlyWarning = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const earlyWarningSchema = new _mongoose.Schema({
  zone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone',
    required: true
  },
  // Warning classification
  warningLevel: {
    type: String,
    enum: ['WATCH', 'ADVISORY', 'WARNING', 'CRITICAL_WARNING'],
    required: true
  },
  // Risk data snapshot
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
  // Location
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
  state: String,
  district: String,
  // Reason
  reason: {
    type: String,
    required: true
  },
  riskDriverSummary: String,   // human-readable summary of contributing factors
  // Triggers that generated this warning
  triggers: [{
    factor: String,            // 'rainfall', 'soilMoisture', 'satelliteChange', etc.
    description: String,
    value: String
  }],
  // Affected area
  affectedVillages: [{
    name: String,
    population: Number
  }],
  affectedRoads: [{
    name: String,
    riskStatus: String
  }],
  estimatedAffectedPopulation: Number,
  // Recommended actions
  recommendedActions: [String],
  // Validity window
  issuedAt: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  // Warning lifecycle
  status: {
    type: String,
    enum: ['ACTIVE', 'UPDATED', 'EXPIRED', 'CANCELLED', 'VERIFIED'],
    default: 'ACTIVE'
  },
  // Escalation history
  escalationHistory: [{
    fromLevel: String,
    toLevel: String,
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Notification tracking
  notificationsSent: {
    type: Number,
    default: 0
  },
  acknowledgedBy: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Data sources used
  dataSources: [String],
  // Issued by (system or manual)
  issuedBy: {
    type: String,
    enum: ['SYSTEM', 'ADMIN', 'FIELD_OFFICER'],
    default: 'SYSTEM'
  },
  issuedByUser: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

earlyWarningSchema.index({ zone: 1, status: 1 });
earlyWarningSchema.index({ location: '2dsphere' });
earlyWarningSchema.index({ warningLevel: 1 });
earlyWarningSchema.index({ status: 1 });
earlyWarningSchema.index({ issuedAt: -1 });
earlyWarningSchema.index({ validUntil: 1 });

const EarlyWarning = exports.EarlyWarning = _mongoose.default.model('EarlyWarning', earlyWarningSchema);
