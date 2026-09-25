import { apps } from '../data/apps';
import { categories, defaultCategoryId } from '../data/categories';
import { profile } from '../data/profile';
import { settings } from '../data/settings';
import { buildMenu } from './buildMenu';
import type { MenuCategory } from './types';

export const menu = buildMenu({ categories, apps, profile, settings });

export interface MenuPosition {
  category: number;
  item: number;
}

export const defaultPosition: MenuPosition = {
  category: Math.max(
    0,
    menu.findIndex((category) => category.id === defaultCategoryId),
  ),
  item: 0,
};

/** Where an item sits in the menu, e.g. to preselect the app a deep link opened. */
export function locateItem(
  categories: readonly MenuCategory[],
  itemId: string,
): MenuPosition | null {
  for (const [category, { items }] of categories.entries()) {
    const item = items.findIndex(({ id }) => id === itemId);
    if (item !== -1) return { category, item };
  }
  return null;
}
