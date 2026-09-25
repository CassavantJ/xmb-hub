export type Route = { kind: 'home' } | { kind: 'app'; appId: string } | { kind: 'notFound' };

/** `/` is the menu and `/app/<id>` opens an embedded app over it; anything else is not found. */
export function parseRoute(pathname: string): Route {
  if (pathname === '/' || pathname === '/index.html') return { kind: 'home' };
  const appId = /^\/app\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(pathname)?.[1];
  return appId ? { kind: 'app', appId } : { kind: 'notFound' };
}

/** Marks history entries the hub pushed, so "back" only pops entries that stay on this site. */
export const HUB_STATE = { hub: true } as const;

export function isHubEntry(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'hub' in state;
}
