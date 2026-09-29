import type { AppEntry } from './schema';
import { site, subdomain } from './site';

/**
 * The app registry. Adding an app to the hub means adding one entry here.
 * Items appear under their category in the order they're listed.
 *
 * Lift Log, Palette, Orbit, Epochs and Gotcha are real apps in their own repos (see ADDING_AN_APP.md). Field
 * Notes is a placeholder, listed as coming soon.
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
    repo: 'https://github.com/CassavantJ/lift-log',
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    description: 'Quick markdown notes that sync across your devices.',
    category: 'apps',
    icon: 'notebook',
    url: subdomain('field-notes'),
    openMode: 'same-tab',
    status: 'coming-soon',
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
    repo: 'https://github.com/CassavantJ/palette',
  },
  {
    id: 'epochs',
    title: 'Epochs',
    description: 'Battle through five eras, from clubs to plasma, in a lane-war strategy game.',
    category: 'games',
    icon: 'swords',
    url: subdomain('epochs'),
    openMode: 'embedded',
    status: 'live',
    tags: ['game', 'strategy', 'canvas'],
    repo: 'https://github.com/CassavantJ/epochs',
  },
  {
    id: 'gotcha',
    title: 'Gotcha!',
    description: 'Fifty trick questions, three lives. Nothing is what it seems.',
    category: 'games',
    icon: 'puzzle',
    url: subdomain('gotcha'),
    openMode: 'embedded',
    status: 'live',
    tags: ['game', 'quiz'],
    repo: 'https://github.com/CassavantJ/gotcha',
  },
  {
    id: 'orbit',
    title: 'Orbit',
    description: 'A small gravity-slingshot puzzle game.',
    category: 'games',
    icon: 'rocket',
    url: subdomain('orbit'),
    openMode: 'embedded',
    status: 'live',
    tags: ['game', 'canvas'],
    repo: 'https://github.com/CassavantJ/orbit',
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
