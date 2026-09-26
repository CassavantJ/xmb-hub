import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { site, siteUrl } from './src/data/site.ts';
import {
  robotsTxt,
  securityHeaders,
  securityHeaderValues,
  sitemapXml,
} from './src/seo/siteFiles.ts';

/**
 * Keeps the domain in one place (src/data/site.ts): fills `%SITE_URL%` in the HTML pages and
 * emits robots.txt, sitemap.xml and Cloudflare's _headers at build time.
 */
function siteFiles(): Plugin {
  return {
    name: 'site-files',
    transformIndexHtml: {
      // Before Vite's own %ENV% replacement, which would warn about an unknown variable.
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '_headers', source: securityHeaders(site.domain) });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(siteUrl, new Date()),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteFiles()],
  // Fixed ports (Vite's 5173/4173 defaults are taken by other local apps). strictPort fails loudly
  // instead of silently moving to the next free port.
  server: { port: 5180, strictPort: true },
  // The production security headers, so `pnpm preview` catches anything the CSP would block.
  preview: { port: 4180, strictPort: true, headers: securityHeaderValues(site.domain) },
  build: {
    rolldownOptions: {
      // 404.html is its own page so Cloudflare Pages can serve it with a real 404 status.
      input: { main: 'index.html', notFound: '404.html' },
    },
  },
});
