import type { AppEntry } from './schema';
import { site, subdomain } from './site';

/**
 * The app registry. Adding an app to the hub means adding one entry here.
 * Items appear under their category in the order they're listed.
 *
 * Everything except `xmb-hub` is a placeholder to populate the layout. Replace them before launch.
 */
export const apps: readonly AppEntry[] = [
  {
    id: 'lift-log',
    title: 'Lift Log',
    description: 'Log workouts and watch your lifts trend upward.',
    category: 'apps',
    icon: 'dumbbell',
    url: subdomain('lift-log'),
    openMode: 'new-tab',
    status: 'beta',
    tags: ['fitness', 'pwa'],
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    description: 'Quick markdown notes that sync across your devices.',
    category: 'apps',
    icon: 'notebook',
    url: subdomain('field-notes'),
    openMode: 'same-tab',
    status: 'live',
  },
  {
    id: 'palette',
    title: 'Palette',
    description: 'Generate accessible color schemes from a single seed color.',
    category: 'tools',
    icon: 'palette',
    url: subdomain('palette'),
    openMode: 'embedded',
    status: 'live',
    tags: ['design', 'color'],
  },
  {
    id: 'orbit',
    title: 'Orbit',
    description: 'A small gravity-slingshot puzzle game.',
    category: 'games',
    icon: 'rocket',
    url: subdomain('orbit'),
    openMode: 'embedded',
    status: 'coming-soon',
  },
  {
    id: 'xmb-hub',
    title: 'XMB Hub',
    description: 'This site: a hub for my apps, built as an homage to a classic console menu.',
    category: 'projects',
    icon: 'layers',
    url: site.repo,
    openMode: 'new-tab',
    status: 'live',
    tags: ['react', 'webgl'],
    repo: site.repo,
  },
];
