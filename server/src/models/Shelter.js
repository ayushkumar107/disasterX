"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Shelter = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const shelterSchema = new _mongoose.Schema({
  name: {
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
  address: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  amenities: {
    water: {
      type: Boolean,
      default: false
    },
    food: {
      type: Boolean,
      default: false
    },
    medical: {
      type: Boolean,
      default: false
    },
    electricity: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    }
  },
  contact: {
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['OPEN', 'FULL', 'CLOSED'],
    default: 'OPEN'
  },
  operatingHours: String,
  createdBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});
shelterSchema.index({
  location: '2dsphere'
});
shelterSchema.index({
  status: 1
});
const Shelter = exports.Shelter = _mongoose.default.model('Shelter', shelterSchema);