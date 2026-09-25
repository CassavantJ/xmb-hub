export const site = {
  name: 'Jake',
  /** The big title in the startup intro. Matches the domain. */
  wordmark: 'Ray Lmao',
  /** Apex domain (bought in Phase 5). Canonical URLs, the sitemap and app subdomains use it. */
  domain: 'raylmao.com',
  repo: 'https://github.com/CassavantJ/xmb-hub',
} as const;

export const siteUrl = `https://${site.domain}`;

/** `https://<name>.<domain>`, where each app is hosted as its own Cloudflare Pages project. */
export function subdomain(name: string): string {
  return `https://${name}.${site.domain}`;
}
