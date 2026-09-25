import { useState } from 'react';

import type { MenuCategory } from '../../menu/types';
import { CategoryBar } from './CategoryBar';
import { ItemColumn } from './ItemColumn';
import styles from './Xmb.module.css';

interface XmbProps {
  menu: readonly MenuCategory[];
  initialCategory: number;
}

export function Xmb({ menu, initialCategory }: XmbProps) {
  // Phase 1 renders a fixed selection. Phase 2 drives it from keyboard, mouse, touch and gamepad.
  const [selection] = useState(() => ({
    category: initialCategory,
    items: menu.map(() => 0),
  }));

  return (
    <div className={styles.xmb}>
      <CategoryBar categories={menu} selected={selection.category} />
      {menu.map((category, index) => (
        <ItemColumn
          key={category.id}
          category={category}
          active={index === selection.category}
          selected={selection.items[index] ?? 0}
        />
      ))}
    </div>
  );
}
