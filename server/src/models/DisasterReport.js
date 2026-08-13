"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DisasterReport = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const disasterReportSchema = new _mongoose.Schema({
  reporter: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disasterId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
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
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  images: [String],
  aiAnalysis: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'AIAnalysis'
  },
  credibilityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  verifications: [{
    userId: {
      type: _mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verified: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'LINKED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});
disasterReportSchema.index({
  location: '2dsphere'
});
disasterReportSchema.index({
  status: 1
});
disasterReportSchema.index({
  reporter: 1
});
const DisasterReport = exports.DisasterReport = _mongoose.default.model('DisasterReport', disasterReportSchema);