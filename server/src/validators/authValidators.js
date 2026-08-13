"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateProfileSchema = exports.registerSchema = exports.refreshSchema = exports.loginSchema = void 0;
var _zod = require("zod");
const registerSchema = exports.registerSchema = _zod.z.object({
  email: _zod.z.string().email('Invalid email address'),
  password: _zod.z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase letter').regex(/[a-z]/, 'Must contain lowercase letter').regex(/[0-9]/, 'Must contain a number'),
  name: _zod.z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: _zod.z.string().optional()
});
const loginSchema = exports.loginSchema = _zod.z.object({
  email: _zod.z.string().email('Invalid email address'),
  password: _zod.z.string().min(1, 'Password is required')
});
const refreshSchema = exports.refreshSchema = _zod.z.object({
  refreshToken: _zod.z.string().min(1, 'Refresh token is required')
});
const updateProfileSchema = exports.updateProfileSchema = _zod.z.object({
  name: _zod.z.string().min(2).max(100).optional(),
  phone: _zod.z.string().optional(),
  locationSharing: _zod.z.enum(['NONE', 'NEARBY', 'RESCUE', 'SOS_ONLY']).optional()
});