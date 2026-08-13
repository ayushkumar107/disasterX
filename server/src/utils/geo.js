"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidCoordinates = exports.haversineDistance = exports.createGeoPoint = void 0;
/**
 * Calculates distance between two points using Haversine formula
 * @returns distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
exports.haversineDistance = haversineDistance;
const toRad = deg => deg * (Math.PI / 180);

/**
 * Creates a GeoJSON Point from coordinates
 */
const createGeoPoint = (lng, lat) => ({
  type: 'Point',
  coordinates: [lng, lat]
});

/**
 * Validates coordinates
 */
exports.createGeoPoint = createGeoPoint;
const isValidCoordinates = (lng, lat) => {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};
exports.isValidCoordinates = isValidCoordinates;