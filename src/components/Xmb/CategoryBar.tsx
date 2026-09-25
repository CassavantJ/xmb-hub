import { Icon } from '../../icons/Icon';
import type { MenuCategory } from '../../menu/types';
import styles from './CategoryBar.module.css';
import { panelId, tabId } from './ids';

interface CategoryBarProps {
  categories: readonly MenuCategory[];
  selected: number;
}

export function CategoryBar({ categories, selected }: CategoryBarProps) {
  return (
    <div role="tablist" aria-label="Categories" className={styles.bar}>
      {categories.map((category, index) => {
        const isSelected = index === selected;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            id={tabId(category.id)}
            aria-controls={panelId(category.id)}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={styles.tab}
            style={{ '--offset': index - selected }}
          >
            <Icon icon={category.icon} className={styles.icon} />
            <span className={styles.label}>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
