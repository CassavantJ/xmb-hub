import type { IconName } from '../icons/icons';

/**
 * A top-level category. `source` says where its items come from:
 * - `registry`: entries in apps.ts whose `category` matches this id
 * - `profile`: the bio and links in profile.ts
 * - `settings`: the entries in settings.ts
 */
export interface CategoryConfig {
  id: string;
  label: string;
  icon: IconName;
  source: 'registry' | 'profile' | 'settings';
}

/** Left-to-right order of the category bar. Registry categories with no apps are hidden. */
export const categories = [
  { id: 'home', label: 'Home', icon: 'user', source: 'profile' },
  { id: 'apps', label: 'Apps', icon: 'layout-grid', source: 'registry' },
  { id: 'games', label: 'Games', icon: 'gamepad', source: 'registry' },
  { id: 'tools', label: 'Tools', icon: 'wrench', source: 'registry' },
  { id: 'projects', label: 'Projects', icon: 'folder-git', source: 'registry' },
  { id: 'settings', label: 'Settings', icon: 'settings', source: 'settings' },
] as const satisfies readonly CategoryConfig[];

export type CategoryId = (typeof categories)[number]['id'];

/** Categories an app can be filed under. Adding a `registry` category above extends this. */
export type RegistryCategoryId = Extract<(typeof categories)[number], { source: 'registry' }>['id'];

/** Selected when the hub first loads. */
export const defaultCategoryId: CategoryId = 'apps';
