import type { MenuCategory } from '../../menu/types';
import { panelId, tabId } from './ids';
import styles from './ItemColumn.module.css';
import { MenuItemRow } from './MenuItemRow';

interface ItemColumnProps {
  category: MenuCategory;
  active: boolean;
  selected: number;
}

export function ItemColumn({ category, active, selected }: ItemColumnProps) {
  return (
    <section
      role="tabpanel"
      id={panelId(category.id)}
      aria-labelledby={tabId(category.id)}
      data-active={active}
      className={styles.panel}
    >
      <ul role="list">
        {category.items.map((item, index) => (
          <li key={item.id}>
            <MenuItemRow item={item} offset={index - selected} />
          </li>
        ))}
      </ul>
    </section>
  );
}
