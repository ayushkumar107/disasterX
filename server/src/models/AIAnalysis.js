"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AIAnalysis = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const aiAnalysisSchema = new _mongoose.Schema({
  type: {
    type: String,
    enum: ['IMAGE_DETECTION', 'RISK_ASSESSMENT', 'CHAT_RESPONSE'],
    required: true
  },
  input: {
    imageUrl: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    query: String
  },
  result: {
    detectedCategory: String,
    confidence: Number,
    severity: String,
    boundingBoxes: [{
      x: Number,
      y: Number,
      w: Number,
      h: Number,
      label: String,
      conf: Number
    }],
    riskScores: _mongoose.Schema.Types.Mixed,
    overallScore: Number,
    response: String,
    sources: [String]
  },
  aiModel: {
    type: String,
    required: true
  },
  processingTime: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});
aiAnalysisSchema.index({
  type: 1
});
aiAnalysisSchema.index({
  createdAt: -1
});
const AIAnalysis = exports.AIAnalysis = _mongoose.default.model('AIAnalysis', aiAnalysisSchema);