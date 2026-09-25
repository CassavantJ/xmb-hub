import { describe, expect, it } from 'vitest';

import { locateItem } from './menu';
import type { MenuCategory, MenuItem } from './types';

const item = (id: string): MenuItem => ({
  id,
  title: id,
  description: '',
  icon: 'rocket',
  badge: null,
  disabled: false,
  action: { kind: 'none' },
});

const categories: MenuCategory[] = [
  { id: 'a', label: 'A', icon: 'home', items: [item('one')] },
  { id: 'b', label: 'B', icon: 'home', items: [item('two'), item('three')] },
];

describe('locateItem', () => {
  it('finds the category and index of an item', () => {
    expect(locateItem(categories, 'three')).toEqual({ category: 1, item: 1 });
  });

  it('returns null for unknown ids', () => {
    expect(locateItem(categories, 'missing')).toBeNull();
  });
});
