import { describe, expect, it } from 'vitest';

import { robotsTxt, securityHeaders, sitemapXml } from './siteFiles';

describe('security headers', () => {
  const headers = securityHeaders('raylmao.com');
  const csp = /Content-Security-Policy: (.*)/.exec(headers)?.[1] ?? '';

  it('stays within Cloudflare Pages limits (2,000 characters per line)', () => {
    for (const line of headers.split('\n')) expect(line.length).toBeLessThanOrEqual(2000);
  });

  it('only frames apps on the site’s own subdomains, and is never framed itself', () => {
    expect(csp).toContain('frame-src https://*.raylmao.com');
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('allows Cloudflare Web Analytics and nothing else third-party', () => {
    expect(csp).toContain("script-src 'self' https://static.cloudflareinsights.com;");
    expect(csp).toContain("connect-src 'self' https://cloudflareinsights.com;");
  });

  it('caches hashed assets for a year', () => {
    expect(headers).toMatch(/\/assets\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/);
  });
});

describe('site files', () => {
  it('allows crawling and links the sitemap', () => {
    expect(robotsTxt('https://raylmao.com')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://raylmao.com/sitemap.xml\n',
    );
  });

  it('lists the home page with a date-only lastmod', () => {
    const xml = sitemapXml('https://raylmao.com', new Date('2026-09-25T18:30:00Z'));
    expect(xml).toContain('<loc>https://raylmao.com/</loc>');
    expect(xml).toContain('<lastmod>2026-09-25</lastmod>');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });
});
