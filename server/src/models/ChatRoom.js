"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Message = exports.ChatRoom = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const chatRoomSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['GLOBAL', 'NEARBY', 'DISASTER', 'RESCUE'],
    default: 'GLOBAL'
  },
  disasterId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  center: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  radius: Number,
  participants: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatRoomSchema.index({
  type: 1
});
chatRoomSchema.index({
  slug: 1
});
chatRoomSchema.index({
  disasterId: 1
});
chatRoomSchema.index({
  center: '2dsphere'
});

const ChatRoom = exports.ChatRoom = _mongoose.default.model('ChatRoom', chatRoomSchema);

const messageSchema = new _mongoose.Schema({
  chatRoom: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  senderName: {
    type: String,
    default: 'Anonymous Responder'
  },
  senderRole: {
    type: String,
    enum: ['CITIZEN', 'RESPONDER', 'VOLUNTEER', 'OFFICIAL', 'SYSTEM'],
    default: 'CITIZEN'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['TEXT', 'LOCATION', 'IMAGE', 'SYSTEM', 'BROADCAST'],
    default: 'TEXT'
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  locationLabel: String,
  disasterId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'Disaster'
  },
  readBy: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deliveredTo: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

messageSchema.index({
  chatRoom: 1,
  createdAt: -1
});
messageSchema.index({
  sender: 1
});

const Message = exports.Message = _mongoose.default.model('Message', messageSchema);
