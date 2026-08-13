"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disasterQuerySchema = exports.createReportSchema = exports.createDisasterSchema = void 0;
var _zod = require("zod");
const createDisasterSchema = exports.createDisasterSchema = _zod.z.object({
  type: _zod.z.enum(['EARTHQUAKE', 'FLOOD', 'WILDFIRE', 'CYCLONE', 'HURRICANE', 'TSUNAMI', 'VOLCANO', 'LANDSLIDE', 'SEVERE_WEATHER', 'OTHER']),
  title: _zod.z.string().min(3).max(200),
  description: _zod.z.string().max(5000).optional(),
  location: _zod.z.object({
    type: _zod.z.literal('Point'),
    coordinates: _zod.z.tuple([_zod.z.number().min(-180).max(180), _zod.z.number().min(-90).max(90)])
  }),
  severity: _zod.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  affectedRadius: _zod.z.number().positive().optional(),
  estimatedAffected: _zod.z.number().int().positive().optional()
});
const disasterQuerySchema = exports.disasterQuerySchema = _zod.z.object({
  page: _zod.z.string().optional(),
  limit: _zod.z.string().optional(),
  type: _zod.z.string().optional(),
  severity: _zod.z.string().optional(),
  status: _zod.z.string().optional(),
  lat: _zod.z.string().optional(),
  lng: _zod.z.string().optional(),
  radius: _zod.z.string().optional()
});
const createReportSchema = exports.createReportSchema = _zod.z.object({
  type: _zod.z.enum(['EARTHQUAKE', 'FLOOD', 'WILDFIRE', 'CYCLONE', 'HURRICANE', 'TSUNAMI', 'VOLCANO', 'LANDSLIDE', 'SEVERE_WEATHER', 'OTHER']),
  title: _zod.z.string().min(3).max(200),
  description: _zod.z.string().min(10).max(5000),
  severity: _zod.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  latitude: _zod.z.number().min(-90).max(90),
  longitude: _zod.z.number().min(-180).max(180)
});