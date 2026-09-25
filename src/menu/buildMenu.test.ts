import { describe, expect, it } from 'vitest';

import { categories } from '../data/categories';
import { profile } from '../data/profile';
import type { AppEntry } from '../data/schema';
import { settings } from '../data/settings';
import { appToItem, buildMenu } from './buildMenu';

const app: AppEntry = {
  id: 'demo',
  title: 'Demo',
  description: 'A demo app.',
  category: 'apps',
  icon: 'rocket',
  url: 'https://demo.example.com',
  openMode: 'new-tab',
  status: 'live',
};

describe('appToItem', () => {
  it('links straight to new-tab and same-tab apps', () => {
    expect(appToItem(app).action).toEqual({ kind: 'link', href: app.url, newTab: true });
    expect(appToItem({ ...app, openMode: 'same-tab' }).action).toEqual({
      kind: 'link',
      href: app.url,
      newTab: false,
    });
  });

  it('routes embedded apps through /app/<id>', () => {
    expect(appToItem({ ...app, openMode: 'embedded' }).action).toEqual({
      kind: 'embed',
      href: '/app/demo',
      src: app.url,
    });
  });

  it('badges beta apps but keeps them openable', () => {
    const item = appToItem({ ...app, status: 'beta' });
    expect(item.badge).toBe('Beta');
    expect(item.disabled).toBe(false);
  });

  it('disables coming-soon apps', () => {
    const item = appToItem({ ...app, status: 'coming-soon' });
    expect(item.badge).toBe('Coming soon');
    expect(item.disabled).toBe(true);
    expect(item.action).toEqual({ kind: 'none' });
  });
});

describe('buildMenu', () => {
  const build = (apps: AppEntry[]) => buildMenu({ categories, apps, profile, settings });

  it('hides registry categories that have no apps', () => {
    expect(build([app]).map((category) => category.id)).toEqual(['home', 'apps', 'settings']);
  });

  it('always shows the profile and settings categories', () => {
    expect(build([]).map((category) => category.id)).toEqual(['home', 'settings']);
  });

  it('keeps registry order within a category', () => {
    const appsCategory = build([{ ...app, id: 'second' }, app]).find(({ id }) => id === 'apps');
    expect(appsCategory?.items.map((item) => item.id)).toEqual(['second', 'demo']);
  });
});
