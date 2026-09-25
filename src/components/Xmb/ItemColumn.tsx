import type { MouseEvent, RefCallback } from 'react';

import type { MenuCategory } from '../../menu/types';
import { panelId, tabId } from './ids';
import styles from './ItemColumn.module.css';
import { MenuItemRow } from './MenuItemRow';

interface ItemColumnProps {
  category: MenuCategory;
  /** Position relative to the selected category: 0 is showing, others slide off to the sides. */
  offset: number;
  selected: number;
  itemRef: (item: number) => RefCallback<HTMLElement>;
  onItemClick: (item: number, event: MouseEvent<HTMLElement>) => void;
  onItemKeyboardFocus: (item: number) => void;
}

export function ItemColumn({
  category,
  offset,
  selected,
  itemRef,
  onItemClick,
  onItemKeyboardFocus,
}: ItemColumnProps) {
  return (
    <section
      role="tabpanel"
      id={panelId(category.id)}
      aria-labelledby={tabId(category.id)}
      data-active={offset === 0}
      className={styles.panel}
      style={{ '--cat-offset': offset }}
    >
      <ul role="list">
        {category.items.map((item, index) => (
          <li key={item.id}>
            <MenuItemRow
              item={item}
              offset={index - selected}
              elementRef={itemRef(index)}
              onClick={(event) => {
                onItemClick(index, event);
              }}
              onKeyboardFocus={() => {
                onItemKeyboardFocus(index);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
