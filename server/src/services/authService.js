"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authService = exports.AuthService = void 0;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _User = require("../models/User");
var _jwt = require("../utils/jwt");
var _errorHandler = require("../middleware/errorHandler");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SALT_ROUNDS = 12;
class AuthService {
  async register(input) {
    const existingUser = await _User.User.findOne({
      email: input.email
    });
    if (existingUser) {
      throw (0, _errorHandler.createError)('Email already registered', 409);
    }
    const hashedPassword = await _bcryptjs.default.hash(input.password, SALT_ROUNDS);
    const user = await _User.User.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      phone: input.phone
    });
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    const accessToken = (0, _jwt.generateAccessToken)(payload);
    const refreshToken = (0, _jwt.generateRefreshToken)(payload);

    // Store refresh token
    await _User.User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: refreshToken
      }
    });
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }
  async login(input) {
    const user = await _User.User.findOne({
      email: input.email
    }).select('+password');
    if (!user) {
      throw (0, _errorHandler.createError)('Invalid email or password', 401);
    }
    const isPasswordValid = await _bcryptjs.default.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw (0, _errorHandler.createError)('Invalid email or password', 401);
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    const accessToken = (0, _jwt.generateAccessToken)(payload);
    const refreshToken = (0, _jwt.generateRefreshToken)(payload);

    // Store refresh token, limit to 5 sessions
    await _User.User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          $each: [refreshToken],
          $slice: -5 // Keep only last 5 refresh tokens
        }
      },
      isOnline: true,
      lastSeen: new Date()
    });
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        locationSharing: user.locationSharing
      },
      accessToken,
      refreshToken
    };
  }
  async refresh(refreshToken) {
    try {
      const payload = (0, _jwt.verifyRefreshToken)(refreshToken);

      // Verify token exists in user's stored tokens
      const user = await _User.User.findById(payload.userId).select('+refreshTokens');
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw (0, _errorHandler.createError)('Invalid refresh token', 401);
      }
      const newPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      };
      const newAccessToken = (0, _jwt.generateAccessToken)(newPayload);
      const newRefreshToken = (0, _jwt.generateRefreshToken)(newPayload);

      // Rotate refresh token
      await _User.User.findByIdAndUpdate(user._id, {
        $pull: {
          refreshTokens: refreshToken
        },
        $push: {
          refreshTokens: newRefreshToken
        }
      });
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw (0, _errorHandler.createError)('Invalid refresh token', 401);
    }
  }
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await _User.User.findByIdAndUpdate(userId, {
        $pull: {
          refreshTokens: refreshToken
        },
        isOnline: false,
        lastSeen: new Date()
      });
    } else {
      // Logout all sessions
      await _User.User.findByIdAndUpdate(userId, {
        refreshTokens: [],
        isOnline: false,
        lastSeen: new Date()
      });
    }
  }
  async getProfile(userId) {
    const user = await _User.User.findById(userId);
    if (!user) {
      throw (0, _errorHandler.createError)('User not found', 404);
    }
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      locationSharing: user.locationSharing,
      isOnline: user.isOnline,
      createdAt: user.createdAt
    };
  }
  async updateProfile(userId, updates) {
    const user = await _User.User.findByIdAndUpdate(userId, {
      $set: updates
    }, {
      new: true,
      runValidators: true
    });
    if (!user) {
      throw (0, _errorHandler.createError)('User not found', 404);
    }
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      locationSharing: user.locationSharing
    };
  }
}
exports.AuthService = AuthService;
const authService = exports.authService = new AuthService();