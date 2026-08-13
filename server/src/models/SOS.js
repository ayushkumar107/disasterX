"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SOS = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const sosSchema = new _mongoose.Schema({
  user: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  status: {
    type: String,
    enum: ['CREATED', 'ACKNOWLEDGED', 'TEAM_ASSIGNED', 'TEAM_DISPATCHED', 'TEAM_ARRIVING', 'RESCUED', 'CANCELLED'],
    default: 'CREATED'
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'HIGH'
  },
  description: String,
  numberOfPeople: {
    type: Number,
    default: 1,
    min: 1
  },
  batteryLevel: Number,
  photo: String,
  voiceNote: String,
  assignedTeam: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'RescueTeam'
  },
  mission: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'RescueMission'
  },
  acknowledgedBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  rescuedAt: Date,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: _mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});
sosSchema.index({
  location: '2dsphere'
});
sosSchema.index({
  status: 1
});
sosSchema.index({
  user: 1
});
sosSchema.index({
  assignedTeam: 1
});
const SOS = exports.SOS = _mongoose.default.model('SOS', sosSchema);