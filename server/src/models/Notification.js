"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Notification = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const notificationSchema = new _mongoose.Schema({
  recipient: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['DISASTER_NEARBY', 'SOS_ACKNOWLEDGED', 'TEAM_ASSIGNED', 'NEW_REPORT', 'ROUTE_HAZARD', 'SHELTER_WARNING', 'SYSTEM'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  data: _mongoose.Schema.Types.Mixed,
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
notificationSchema.index({
  recipient: 1,
  read: 1
});
notificationSchema.index({
  createdAt: -1
});
const Notification = exports.Notification = _mongoose.default.model('Notification', notificationSchema);