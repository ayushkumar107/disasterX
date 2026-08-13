"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _authController = require("../controllers/authController");
var _auth = require("../middleware/auth");
var _validate = require("../middleware/validate");
var _rateLimiter = require("../middleware/rateLimiter");
var _authValidators = require("../validators/authValidators");
const router = (0, _express.Router)();
router.post('/register', _rateLimiter.authLimiter, (0, _validate.validate)(_authValidators.registerSchema), (req, res, next) => _authController.authController.register(req, res, next));
router.post('/login', _rateLimiter.authLimiter, (0, _validate.validate)(_authValidators.loginSchema), (req, res, next) => _authController.authController.login(req, res, next));
router.post('/refresh', (0, _validate.validate)(_authValidators.refreshSchema), (req, res, next) => _authController.authController.refresh(req, res, next));
router.post('/logout', _auth.authenticate, (req, res, next) => _authController.authController.logout(req, res, next));
router.get('/me', _auth.authenticate, (req, res, next) => _authController.authController.getProfile(req, res, next));
router.patch('/profile', _auth.authenticate, (0, _validate.validate)(_authValidators.updateProfileSchema), (req, res, next) => _authController.authController.updateProfile(req, res, next));
var _default = exports.default = router;