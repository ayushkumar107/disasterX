"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.osirisNewsAdapter = exports.OsirisNewsAdapter = void 0;
var _BaseAdapter = require("./BaseAdapter");
var _env = require("../../config/env");
var _logger = require("../../utils/logger");

/**
 * OsirisNewsAdapter
 *
 * Fetches global disaster-related news from OSIRIS (https://osirisai.live/api/news).
 *
 * Unlike other adapters, this does NOT write to the Disaster collection.
 * Instead, it is used as a read-through data source by the news controller
 * to serve contextual disaster news alongside active events.
 *
 * The response is cached in-memory with a TTL to avoid hammering the
 * upstream API on every request.
 */
class OsirisNewsAdapter extends _BaseAdapter.DataAdapter {
  constructor() {
    super('OSIRIS_NEWS', _env.env.OSIRIS_API_URL);
    this._cache = null;
    this._cacheExpiry = 0;
    this._cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Returns the news feed. Uses an in-memory cache to avoid
   * calling the upstream API on every client request.
   */
  async getNews() {
    const now = Date.now();
    if (this._cache && now < this._cacheExpiry) {
      return this._cache;
    }

    _logger.logger.info(`Fetching news from ${this.sourceName}...`);
    const data = await this.makeRequest('/news');

    if (!data) {
      // Return stale cache if upstream fails, or empty array
      return this._cache || [];
    }

    // OSIRIS /api/news returns { news: [...], total, timestamp }
    const articles = Array.isArray(data) ? data : (data.news || data.articles || data.items || []);

    const normalized = articles.map(article => ({
      id: article.id || article.guid || article.link,
      title: article.title,
      description: article.description || article.summary || '',
      url: article.link || article.url,
      source: article.source || article.publisher || 'Unknown',
      publishedAt: article.published || article.publishedAt || article.pubDate || article.date,
      image: article.image || article.thumbnail || null,
      category: article.category || 'general',
      riskScore: article.risk_score || null,
      coordinates: article.coords || null,
      machineAssessment: article.machine_assessment || null
    }));

    this._cache = normalized;
    this._cacheExpiry = now + this._cacheTTL;

    _logger.logger.info(`Successfully fetched ${normalized.length} news articles from OSIRIS`);
    return normalized;
  }

  /**
   * Not used for ingestion — included only to satisfy the adapter interface.
   */
  async fetchData() {
    return [];
  }
}
exports.OsirisNewsAdapter = OsirisNewsAdapter;
const osirisNewsAdapter = exports.osirisNewsAdapter = new OsirisNewsAdapter();
