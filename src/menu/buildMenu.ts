import type { CategoryConfig } from '../data/categories';
import type { Profile, ProfileLink } from '../data/profile';
import type { AppEntry, AppStatus } from '../data/schema';
import type { SettingEntry } from '../data/settings';
import type { MenuAction, MenuCategory, MenuItem } from './types';

export interface MenuSources {
  categories: readonly CategoryConfig[];
  apps: readonly AppEntry[];
  profile: Profile;
  settings: readonly SettingEntry[];
}

const STATUS_BADGE: Record<AppStatus, string | null> = {
  live: null,
  beta: 'Beta',
  'coming-soon': 'Coming soon',
};

/** Turns the config files into the category → item tree the XMB renders. */
export function buildMenu(sources: MenuSources): MenuCategory[] {
  return sources.categories.flatMap((category) => {
    const items = itemsFor(category, sources);
    // An empty registry category is hidden rather than shown with nothing under it.
    if (category.source === 'registry' && items.length === 0) return [];
    return [{ id: category.id, label: category.label, icon: category.icon, items }];
  });
}

function itemsFor(category: CategoryConfig, sources: MenuSources): MenuItem[] {
  switch (category.source) {
    case 'registry':
      return sources.apps.filter((app) => app.category === category.id).map(appToItem);
    case 'profile':
      return [aboutItem(sources.profile), ...sources.profile.links.map(linkToItem)];
    case 'settings':
      return sources.settings.map(settingToItem);
  }
}

export function appToItem(app: AppEntry): MenuItem {
  return {
    id: app.id,
    title: app.title,
    description: app.description,
    icon: app.icon,
    badge: STATUS_BADGE[app.status],
    disabled: app.status === 'coming-soon',
    action: appAction(app),
  };
}

function appAction(app: AppEntry): MenuAction {
  if (app.status === 'coming-soon') return { kind: 'none' };
  if (app.openMode === 'embedded') return { kind: 'embed', href: `/app/${app.id}`, src: app.url };
  return { kind: 'link', href: app.url, newTab: app.openMode === 'new-tab' };
}

function aboutItem(profile: Profile): MenuItem {
  return {
    id: 'about',
    title: profile.name,
    description: profile.headline,
    icon: 'user',
    badge: null,
    disabled: false,
    action: { kind: 'panel', panel: 'about' },
  };
}

function linkToItem(link: ProfileLink): MenuItem {
  return {
    id: link.id,
    title: link.title,
    description: link.description,
    icon: link.icon,
    badge: null,
    disabled: false,
    action: { kind: 'link', href: link.url, newTab: !link.url.startsWith('mailto:') },
  };
}

function settingToItem(setting: SettingEntry): MenuItem {
  return {
    id: setting.id,
    title: setting.title,
    description: setting.description,
    icon: setting.icon,
    badge: null,
    disabled: false,
    action: { kind: 'setting', setting: setting.id },
  };
}
