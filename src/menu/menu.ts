import { apps } from '../data/apps';
import { categories, defaultCategoryId } from '../data/categories';
import { profile } from '../data/profile';
import { settings } from '../data/settings';
import { buildMenu } from './buildMenu';

export const menu = buildMenu({ categories, apps, profile, settings });

export const defaultCategoryIndex = Math.max(
  0,
  menu.findIndex((category) => category.id === defaultCategoryId),
);
