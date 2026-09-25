/** robots.txt: crawl everything, and point to the sitemap. */
export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/**
 * sitemap.xml. The hub is one page: embedded apps at /app/<id> are thin wrappers around other
 * sites, so they're left out rather than indexed as near-empty pages.
 */
export function sitemapXml(siteUrl: string, lastModified: Date): string {
  const date = lastModified.toISOString().slice(0, 10);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc><lastmod>${date}</lastmod></url>`,
    '</urlset>',
    '',
  ].join('\n');
}
