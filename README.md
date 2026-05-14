# XCrawl Scraper

[![npm version](https://img.shields.io/npm/v/xcrawl-scraper)](https://www.npmjs.com/package/xcrawl-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Node.js SDK + CLI for XCrawl — the web scraping API that handles JS rendering, CAPTCHAs, and proxy rotation automatically.**

```bash
npx xcrawl-scraper scrape https://example.com --api-key YOUR_KEY
```

## Features

- **Scrape** any URL → clean Markdown, JSON, HTML, or text
- **Search** the web → structured results with snippets
- **Crawl** entire sites → built-in sitemap discovery
- **AI extraction** → describe what you want in plain English, get JSON
- **Proxy control** → choose exit region (US, JP, DE, etc.) or sticky sessions
- **Batch scrape** → concurrent scraping with configurable limits

## Installation

```bash
npm install xcrawl-scraper
```

## Quick Start

```typescript
import { XCrawlScraper } from 'xcrawl-scraper';

const xcrawl = new XCrawlScraper({
  apiKey: process.env.XCRAWL_API_KEY,
});

// Scrape a page to Markdown
const result = await xcrawl.scrapeMarkdown('https://example.com');
console.log(result.data?.markdown);

// Search the web
const search = await xcrawl.search({ query: 'web scraping api', limit: 5 });
console.log(search.data.data.map(r => `${r.position}. ${r.title || r.url}`));

// AI extraction — describe what you want
const extracted = await xcrawl.extractJson(
  'https://news.ycombinator.com',
  'Extract top 3 stories with title, points, and author'
);
console.log(extracted.data?.json);
```

## API Reference

### `XCrawlScraper(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **required** | Your XCrawl API key |
| `timeout` | `number` | `60000` | Request timeout in ms |

### Methods

#### `scrape(options)` → Scrape a URL

```typescript
await xcrawl.scrape({
  url: 'https://example.com',
  output: { formats: ['markdown', 'json'] },
  proxy: { location: 'JP' },     // optional: choose exit region
  wait_for: 2000,                 // optional: wait for JS to render (ms)
  selector: 'main',               // optional: extract only a CSS selector
  screenshot: false,
  json: { prompt: 'Extract product name, price, and availability' },
});
```

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | **Required.** Target URL |
| `output.formats` | `string[]` | Output formats: `markdown`, `json`, `text`, `html`, `screenshot`, `links` |
| `json.prompt` | `string` | Natural language prompt for AI extraction |
| `proxy.location` | `string` | Country code (US, JP, DE, GB, etc.) |
| `proxy.sticky_session` | `string` | Session ID for sticky proxy connection |
| `wait_for` | `number` | Milliseconds to wait for JS rendering |
| `selector` | `string` | CSS selector to extract specific content |
| `remove_selectors` | `string[]` | CSS selectors of elements to remove |
| `screenshot` | `boolean` | Include page screenshot (base64) |
| `only_metadata` | `boolean` | Only return page headers/metadata |

#### `scrapeMarkdown(url)` → Quick Markdown scrape

Simplified call, returns Markdown content.

#### `extractJson(url, prompt)` → AI extraction

```typescript
const data = await xcrawl.extractJson(
  'https://example.com/products',
  'Extract product names, prices, and ratings'
);
```

#### `search(options)` → Web search

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `query` | `string` | — | Search query |
| `location` | `string` | — | Country code (US, JP, DE) |
| `language` | `string` | — | Language code (en, ja, de) |
| `limit` | `number` | `10` | Max results |
| `proxy.location` | `string` | — | Exit region for search |

#### `crawl(options)` → Full site crawl

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | — | **Required.** Starting URL |
| `crawler.limit` | `number` | — | Max pages to crawl |
| `crawler.max_depth` | `number` | — | Max crawl depth |
| `crawler.include_patterns` | `string[]` | — | Only crawl matching URLs (glob) |
| `crawler.exclude_patterns` | `string[]` | — | Skip matching URLs (glob) |
| `output.formats` | `string[]` | — | Output formats |
| `proxy.location` | `string` | — | Exit region |

#### `getCrawlStatus(crawlId)` → Poll crawl results

Crawl is async — use this to check status and get results.

## CLI Usage

```bash
# Set your API key
export XCRAWL_API_KEY=your_key_here

# Scrape a URL
npx xcrawl-scraper scrape https://example.com --format markdown

# Search the web
npx xcrawl-scraper search "web scraping tools" --limit 5

# AI extraction
npx xcrawl-scraper extract https://example.com "Extract page title and description"

# Crawl a site
npx xcrawl-scraper crawl https://docs.example.com --depth 2 --limit 10

# With proxy (JP exit)
npx xcrawl-scraper scrape https://example.com --proxy JP
```

### CLI Options

| Flag | Description |
|------|-------------|
| `-k, --api-key` | API key (or use `XCRAWL_API_KEY` env) |
| `-f, --format` | Output format: markdown, json, text |
| `-p, --proxy` | Proxy location: US, JP, DE, GB... |
| `-l, --limit` | Max results (search) or pages (crawl) |
| `-d, --depth` | Max crawl depth |
| `--selector` | CSS selector for scraping |
| `--json` | Output raw JSON |
| `--pretty` | Pretty-print JSON |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `XCRAWL_API_KEY` | Your XCrawl API key |

## Pricing

XCrawl uses a **credit system** (not per-request):

| Operation | Credits |
|-----------|---------|
| Basic scrape (Markdown) | 1 |
| Search (2 results) | 2 |
| AI extraction | 5 |
| Full crawl (per page) | 1–5 |

Plans: **Free** (1000 credits) → **Hobby $8/mo** (5k) → **Starter $49/mo** (60k) → **Pro $199/mo** (350k)

## Links

- [XCrawl Dashboard](https://dash.xcrawl.com) — Get your API key
- [Documentation](https://docs.xcrawl.com) — Full API reference
- [GitHub](https://github.com/xcrawl-api/xcrawl-sdk) — SDK source

## License

MIT
