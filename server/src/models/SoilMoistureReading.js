"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SoilMoistureReading = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const soilMoistureReadingSchema = new _mongoose.Schema({
  sensor: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'SoilMoistureSensor',
    required: true
  },
  moisture: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  temperature: Number,  // soil temperature °C
  saturationLevel: {
    type: String,
    enum: ['DRY', 'NORMAL', 'WET', 'VERY_WET', 'SATURATED'],
    required: true
  },
  // Data provenance
  dataSource: {
    type: String,
    enum: ['REAL', 'SIMULATED'],
    default: 'SIMULATED'
  },
  readingAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

soilMoistureReadingSchema.index({ sensor: 1, readingAt: -1 });
soilMoistureReadingSchema.index({ readingAt: -1 });

const SoilMoistureReading = exports.SoilMoistureReading = _mongoose.default.model('SoilMoistureReading', soilMoistureReadingSchema);
