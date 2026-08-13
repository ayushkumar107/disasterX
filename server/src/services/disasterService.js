"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disasterService = exports.DisasterService = void 0;
var _Disaster = require("../models/Disaster");
var _pagination = require("../utils/pagination");
var _errorHandler = require("../middleware/errorHandler");
class DisasterService {
  async getDisasters(req) {
    const pagination = (0, _pagination.parsePagination)(req);
    const {
      type,
      severity,
      status
    } = req.query;
    const filter = {};
    if (type) {
      const types = type.split(',');
      filter.type = {
        $in: types
      };
    }
    if (severity) {
      const severities = severity.split(',');
      filter.severity = {
        $in: severities
      };
    }
    if (status) {
      const statuses = status.split(',');
      filter.status = {
        $in: statuses
      };
    } else {
      filter.status = {
        $in: ['ACTIVE', 'MONITORING']
      };
    }
    const [disasters, total] = await Promise.all([_Disaster.Disaster.find(filter).sort({
      startDate: -1
    }).skip(pagination.skip).limit(pagination.limit).lean(), _Disaster.Disaster.countDocuments(filter)]);
    return (0, _pagination.paginatedResponse)(disasters, total, pagination);
  }
  async getDisasterById(id) {
    const disaster = await _Disaster.Disaster.findById(id).lean();
    if (!disaster) {
      throw (0, _errorHandler.createError)('Disaster not found', 404);
    }
    return disaster;
  }
  async getNearbyDisasters(lat, lng, radiusKm = 100) {
    const disasters = await _Disaster.Disaster.find({
      status: {
        $in: ['ACTIVE', 'MONITORING']
      },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      }
    }).limit(50).lean();
    return disasters;
  }
  async createDisaster(data) {
    const disaster = await _Disaster.Disaster.create(data);
    return disaster;
  }
  async updateDisaster(id, data) {
    const disaster = await _Disaster.Disaster.findByIdAndUpdate(id, {
      $set: data
    }, {
      new: true
    });
    if (!disaster) {
      throw (0, _errorHandler.createError)('Disaster not found', 404);
    }
    return disaster;
  }
  async getStats() {
    const [total, active, critical, byType] = await Promise.all([_Disaster.Disaster.countDocuments(), _Disaster.Disaster.countDocuments({
      status: 'ACTIVE'
    }), _Disaster.Disaster.countDocuments({
      status: 'ACTIVE',
      severity: 'CRITICAL'
    }), _Disaster.Disaster.aggregate([{
      $match: {
        status: 'ACTIVE'
      }
    }, {
      $group: {
        _id: '$type',
        count: {
          $sum: 1
        }
      }
    }])]);
    return {
      total,
      active,
      critical,
      byType
    };
  }
}
exports.DisasterService = DisasterService;
const disasterService = exports.disasterService = new DisasterService();