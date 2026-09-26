/**
 * Security headers for every response. The Content Security Policy only allows this site's own
 * files, embedded apps on this domain's subdomains, and Cloudflare Web Analytics.
 * Also served by `vite preview`, so a local production build behaves like the real site.
 */
export function securityHeaderValues(domain: string): Record<string, string> {
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://static.cloudflareinsights.com",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    `frame-src https://*.${domain}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}

/**
 * Cloudflare Pages `_headers`: the security headers on everything, plus long-lived caching for
 * Vite's content-hashed assets (their names change whenever their contents do).
 */
export function securityHeaders(domain: string): string {
  const lines = Object.entries(securityHeaderValues(domain)).map(
    ([name, value]) => `  ${name}: ${value}`,
  );
  return [
    '/*',
    ...lines,
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
}

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
