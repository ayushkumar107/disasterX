"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TerrainFeature = void 0;
var _mongoose = _interopRequireWildcard(require("mongoose"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }

const terrainFeatureSchema = new _mongoose.Schema({
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
  state: {
    type: String,
    enum: ['Assam', 'Arunachal Pradesh', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim']
  },
  district: String,
  // DEM-derived
  elevation: {
    type: Number,
    required: true     // meters above sea level
  },
  slope: {
    type: Number,
    required: true     // degrees
  },
  aspect: {
    type: String,
    enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'FLAT']
  },
  // Slope classification
  slopeClass: {
    type: String,
    enum: ['GENTLE', 'MODERATE', 'STEEP', 'VERY_STEEP', 'PRECIPITOUS'],
    required: true
  },
  // Terrain susceptibility
  susceptibility: {
    type: String,
    enum: ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'],
    default: 'MODERATE'
  },
  susceptibilityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  // Geology
  geologyType: String,    // e.g., 'Sedimentary', 'Metamorphic', 'Alluvial'
  geologyDescription: String,
  // Land cover
  landCoverType: String,  // e.g., 'Dense Forest', 'Scrubland', 'Bare Rock', 'Agriculture'
  vegetationDensity: {
    type: String,
    enum: ['DENSE', 'MODERATE', 'SPARSE', 'NONE']
  },
  // Soil
  soilType: String,       // e.g., 'Laterite', 'Clay', 'Sandy Loam'
  soilDepth: Number,      // cm
  // Curvature
  curvature: {
    type: String,
    enum: ['CONCAVE', 'FLAT', 'CONVEX']
  },
  // Drainage
  drainageDensity: Number,     // km/km²
  distanceToStream: Number,    // meters
  // Associated risk zone
  riskZone: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'LandslideRiskZone'
  },
  // Data provenance
  dataSource: {
    type: String,
    enum: ['DEM', 'SURVEY', 'ESTIMATED', 'DEMO'],
    default: 'DEMO'
  },
  resolution: String  // e.g., '30m SRTM', '12.5m ALOS'
}, {
  timestamps: true
});

terrainFeatureSchema.index({ location: '2dsphere' });
terrainFeatureSchema.index({ state: 1 });
terrainFeatureSchema.index({ slopeClass: 1 });
terrainFeatureSchema.index({ susceptibility: 1 });
terrainFeatureSchema.index({ riskZone: 1 });

const TerrainFeature = exports.TerrainFeature = _mongoose.default.model('TerrainFeature', terrainFeatureSchema);
