import { useId } from 'react';

import { Icon } from '../../icons/Icon';
import type { MenuItem } from '../../menu/types';
import styles from './MenuItemRow.module.css';

interface MenuItemRowProps {
  item: MenuItem;
  /** Position relative to the selected item: 0 is selected, negative sits above the bar. */
  offset: number;
}

export function MenuItemRow({ item, offset }: MenuItemRowProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const { action } = item;
  const newTab = action.kind === 'link' && action.newTab;

  const shared = {
    className: styles.item,
    'data-position': offset === 0 ? 'current' : offset < 0 ? 'before' : 'after',
    style: { '--offset': offset },
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  };

  const content = (
    <>
      <Icon icon={item.icon} className={styles.icon} />
      <span className={styles.text}>
        <span id={titleId} className={styles.title}>
          {item.title}
          {item.badge && (
            <span className={styles.badge}>
              <span className="sr-only">, </span>
              {item.badge}
            </span>
          )}
        </span>
        <span id={descriptionId} className={styles.description}>
          {item.description}
          {newTab && <span className="sr-only"> (opens in a new tab)</span>}
        </span>
      </span>
    </>
  );

  if (action.kind === 'link' || action.kind === 'embed') {
    return (
      <a
        {...shared}
        href={action.href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button {...shared} type="button" aria-disabled={item.disabled || undefined}>
      {content}
    </button>
  );
}
