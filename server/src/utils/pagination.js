"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePagination = exports.paginatedResponse = void 0;
const parsePagination = req => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip
  };
};
exports.parsePagination = parsePagination;
const paginatedResponse = (data, total, options) => ({
  data,
  pagination: {
    page: options.page,
    limit: options.limit,
    total,
    pages: Math.ceil(total / options.limit),
    hasNext: options.page * options.limit < total,
    hasPrev: options.page > 1
  }
});
exports.paginatedResponse = paginatedResponse;