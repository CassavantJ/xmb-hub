import { describe, expect, it } from 'vitest';

import { robotsTxt, sitemapXml } from './siteFiles';

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
