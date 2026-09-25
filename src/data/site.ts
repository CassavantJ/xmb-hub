export const site = {
  name: 'Jake',
  /** Apex domain. A placeholder until Phase 5; every `subdomain()` URL derives from it. */
  domain: 'example.com',
  repo: 'https://github.com/CassavantJ/xmb-hub',
} as const;

/** `https://<name>.<domain>`, where each app is hosted as its own Cloudflare Pages project. */
export function subdomain(name: string): string {
  return `https://${name}.${site.domain}`;
}
