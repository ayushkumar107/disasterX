"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newsController = exports.NewsController = void 0;
var _OsirisNewsAdapter = require("../services/adapters/OsirisNewsAdapter");
var _logger = require("../utils/logger");

class NewsController {
  /**
   * GET /api/news
   * Returns global disaster-related news from the OSIRIS platform.
   * Supports optional query parameters:
   *   ?limit=N  — max number of articles (default: 50)
   *   ?q=term   — filter articles by keyword in title/description
   */
  async getNews(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
      const query = (req.query.q || '').toLowerCase().trim();

      let articles = await _OsirisNewsAdapter.osirisNewsAdapter.getNews();

      // Optional keyword filter
      if (query) {
        articles = articles.filter(article => {
          const title = (article.title || '').toLowerCase();
          const desc = (article.description || '').toLowerCase();
          return title.includes(query) || desc.includes(query);
        });
      }

      // Apply limit
      articles = articles.slice(0, limit);

      res.json({
        success: true,
        data: articles,
        total: articles.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      _logger.logger.error({ msg: 'Failed to fetch news', error: error.message });
      next(error);
    }
  }
}
exports.NewsController = NewsController;
const newsController = exports.newsController = new NewsController();
