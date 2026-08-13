"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireRole = exports.requireMinRole = void 0;
const roleHierarchy = {
  USER: 0,
  VOLUNTEER: 1,
  RESCUE_TEAM: 2,
  ADMIN: 3
};

/**
 * Restricts access to specific roles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required'
      });
      return;
    }
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Insufficient permissions'
      });
      return;
    }
    next();
  };
};

/**
 * Requires minimum role level (inclusive)
 */
exports.requireRole = requireRole;
const requireMinRole = minRole => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required'
      });
      return;
    }
    const userRole = req.user.role;
    if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
      res.status(403).json({
        error: 'Insufficient permissions'
      });
      return;
    }
    next();
  };
};
exports.requireMinRole = requireMinRole;