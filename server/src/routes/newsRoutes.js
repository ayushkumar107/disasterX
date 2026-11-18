"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _newsController = require("../controllers/newsController");

const router = (0, _express.Router)();

// GET /api/news — public endpoint, no auth required
router.get('/', (req, res, next) => _newsController.newsController.getNews(req, res, next));

var _default = exports.default = router;
