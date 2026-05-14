/**
 * XCrawl Scraper — Node.js SDK
 *
 * Official SDK for the XCrawl Web Scraping Proxy API.
 * Scrape web pages with automatic IP rotation and anti-bot bypass.
 *
 * Base URL: https://run.xcrawl.com
 * Auth: Authorization: Bearer <API_KEY>
 * Docs: https://docs.xcrawl.com
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// ============================================================
// Types
// ============================================================

export interface XCrawlConfig {
  apiKey: string;
  timeout?: number;
}

export interface ScrapeOutput {
  formats: Array<'markdown' | 'json' | 'text' | 'html' | 'screenshot' | 'links'>;
}

export interface ScrapeOptions {
  url: string;
  output?: ScrapeOutput;
  /** Natural language extraction prompt (JSON format) */
  json?: { prompt: string };
  /** Proxy configuration */
  proxy?: {
    location?: string;
    sticky_session?: string;
  };
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  /** Wait time for JS-rendered content (ms) */
  wait_for?: number;
  /** Extract only specific CSS selector */
  selector?: string;
  /** Remove elements matching CSS selector(s) */
  remove_selectors?: string[];
  /** Include page screenshot */
  screenshot?: boolean;
  /** Only return page metadata (no content) */
  only_metadata?: boolean;
}

export interface SearchOptions {
  query: string;
  location?: string;
  language?: string;
  limit?: number;
  proxy?: {
    location?: string;
    sticky_session?: string;
  };
}

export interface CrawlOptions {
  url: string;
  crawler?: {
    limit?: number;
    max_depth?: number;
    include_patterns?: string[];
    exclude_patterns?: string[];
  };
  output?: ScrapeOutput;
  proxy?: {
    location?: string;
    sticky_session?: string;
  };
}

export interface ScrapeResponse {
  scrape_id?: string;
  endpoint: string;
  version: string;
  status: 'completed' | 'failed' | 'pending';
  url?: string;
  data?: {
    markdown?: string;
    json?: Record<string, unknown>;
    text?: string;
    html?: string;
    screenshot?: string;
    links?: string[];
    metadata?: {
      content_type: string;
      final_url: string;
      status_code: number;
      title: string;
    };
    traffic_bytes?: number;
    credits_used?: number;
    credits_detail?: Record<string, number>;
  };
  credits_used?: number;
  total_credits_used?: number;
  started_at?: string;
  ended_at?: string;
  error?: string;
}

export interface SearchResponse {
  search_id?: string;
  endpoint: string;
  version: string;
  status: 'completed' | 'failed';
  query: string;
  data: {
    credits_used: number;
    data: Array<{
      position: number;
      title: string | null;
      url: string;
      snippet?: string;
    }>;
    status: string;
  };
  total_credits_used: number;
  started_at: string;
  ended_at: string;
  error?: string;
}

export interface CrawlResponse {
  crawl_id?: string;
  endpoint: string;
  version: string;
  status: 'crawling' | 'completed' | 'failed';
  url?: string;
  completed?: number;
  total?: number;
  data?: Array<{
    markdown?: string;
    json?: Record<string, unknown>;
    metadata: {
      statusCode: number;
      title: string;
      url: string;
    };
    traffic_bytes: number;
    credits_used: number;
  }>;
  total_credits_used?: number;
  started_at?: string;
  ended_at?: string;
  error?: string;
}

// ============================================================
// Main Class
// ============================================================

export class XCrawlScraper {
  private client: AxiosInstance;
  private config: Required<XCrawlConfig>;

  constructor(config: XCrawlConfig) {
    this.config = {
      apiKey: config.apiKey,
      timeout: config.timeout || 60000,
    };

    this.client = axios.create({
      baseURL: 'https://run.xcrawl.com',
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });
  }

  // ==========================================================
  // Scrape — Fetch a single URL
  // ==========================================================

  async scrape(options: ScrapeOptions): Promise<ScrapeResponse> {
    try {
      const response = await this.client.post('/v1/scrape', options);
      return response.data as ScrapeResponse;
    } catch (err: unknown) {
      return this.handleError<ScrapeResponse>(err, {
        endpoint: 'scrape',
        version: '',
        status: 'failed',
        error: this.extractError(err),
      });
    }
  }

  /** Scrape and get structured JSON via natural language prompt */
  async extractJson(url: string, prompt: string): Promise<ScrapeResponse> {
    return this.scrape({
      url,
      output: { formats: ['json'] },
      json: { prompt },
    });
  }

  /** Scrape to Markdown (simple convenience method) */
  async scrapeMarkdown(url: string): Promise<ScrapeResponse> {
    return this.scrape({
      url,
      output: { formats: ['markdown'] },
    });
  }

  // ==========================================================
  // Search — Web search
  // ==========================================================

  async search(options: SearchOptions): Promise<SearchResponse> {
    try {
      const response = await this.client.post('/v1/search', options);
      return response.data as SearchResponse;
    } catch (err: unknown) {
      return this.handleError<SearchResponse>(err, {
        endpoint: 'search',
        version: '',
        status: 'failed',
        query: options.query,
        data: { credits_used: 0, data: [], status: 'failed' },
        total_credits_used: 0,
        started_at: '',
        ended_at: '',
        error: this.extractError(err),
      });
    }
  }

  // ==========================================================
  // Crawl — Full site crawl
  // ==========================================================

  async crawl(options: CrawlOptions): Promise<CrawlResponse> {
    try {
      const response = await this.client.post('/v1/crawl', options);
      return response.data as CrawlResponse;
    } catch (err: unknown) {
      return this.handleError<CrawlResponse>(err, {
        endpoint: 'crawl',
        version: '',
        status: 'failed',
        error: this.extractError(err),
      });
    }
  }

  /** Poll crawl status */
  async getCrawlStatus(crawlId: string): Promise<CrawlResponse> {
    try {
      const response = await this.client.get(`/v1/crawl/${crawlId}`);
      return response.data as CrawlResponse;
    } catch (err: unknown) {
      return this.handleError<CrawlResponse>(err, {
        endpoint: 'crawl',
        version: '',
        status: 'failed',
        error: this.extractError(err),
      });
    }
  }

  // ==========================================================
  // Utility
  // ==========================================================

  /** Update API key */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
  }

  /** Create instance from environment variables */
  static fromEnv(): XCrawlScraper {
    const apiKey = process.env.XCRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('XCRAWL_API_KEY environment variable is not set');
    }
    return new XCrawlScraper({ apiKey });
  }

  private extractError(err: unknown): string {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || err.message;
    }
    return String(err);
  }

  private handleError<T>(err: unknown, fallback: T): T {
    return fallback;
  }
}

// ============================================================
// Default Export
// ============================================================

export default XCrawlScraper;
