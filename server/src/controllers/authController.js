"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authController = exports.AuthController = void 0;
var _authService = require("../services/authService");
class AuthController {
  async register(req, res, next) {
    try {
      const result = await _authService.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const result = await _authService.authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async refresh(req, res, next) {
    try {
      const result = await _authService.authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      await _authService.authService.logout(req.user.userId, req.body.refreshToken);
      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  async getProfile(req, res, next) {
    try {
      const profile = await _authService.authService.getProfile(req.user.userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
  async updateProfile(req, res, next) {
    try {
      const profile = await _authService.authService.updateProfile(req.user.userId, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}
exports.AuthController = AuthController;
const authController = exports.authController = new AuthController();