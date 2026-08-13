"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RescueTeam = exports.RescueMission = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const rescueTeamSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  leader: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'TRAVELING', 'ON_SITE', 'COMPLETED', 'OFFLINE'],
    default: 'AVAILABLE'
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  specialization: [String],
  equipment: [String],
  activeMission: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'RescueMission'
  },
  completedMissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
rescueTeamSchema.index({
  location: '2dsphere'
});
rescueTeamSchema.index({
  status: 1
});
const RescueTeam = exports.RescueTeam = _mongoose.default.model('RescueTeam', rescueTeamSchema);
const rescueMissionSchema = new _mongoose.Schema({
  sos: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'SOS',
    required: true
  },
  team: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'RescueTeam',
    required: true
  },
  assignedBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'FAILED'],
    default: 'ASSIGNED'
  },
  eta: Number,
  notes: [String],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});
rescueMissionSchema.index({
  sos: 1
});
rescueMissionSchema.index({
  team: 1
});
rescueMissionSchema.index({
  status: 1
});
const RescueMission = exports.RescueMission = _mongoose.default.model('RescueMission', rescueMissionSchema);