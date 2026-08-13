"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Disaster = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const disasterSchema = new _mongoose.Schema({
  externalId: String,
  source: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['EARTHQUAKE', 'FLOOD', 'WILDFIRE', 'CYCLONE', 'HURRICANE', 'TSUNAMI', 'VOLCANO', 'LANDSLIDE', 'SEVERE_WEATHER', 'OTHER'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
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
  affectedRadius: Number,
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'MONITORING', 'RESOLVED'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  estimatedAffected: Number,
  confidence: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  metadata: {
    type: _mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedReports: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'DisasterReport'
  }]
}, {
  timestamps: true
});
disasterSchema.index({
  location: '2dsphere'
});
disasterSchema.index({
  type: 1
});
disasterSchema.index({
  severity: 1
});
disasterSchema.index({
  status: 1
});
disasterSchema.index({
  externalId: 1,
  source: 1
}, {
  unique: true,
  sparse: true
});
const Disaster = exports.Disaster = _mongoose.default.model('Disaster', disasterSchema);