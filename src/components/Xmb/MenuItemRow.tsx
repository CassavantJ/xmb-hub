import type { FocusEvent, MouseEvent, RefCallback } from 'react';

import { Icon } from '../../icons/Icon';
import type { MenuItem } from '../../menu/types';
import styles from './MenuItemRow.module.css';

interface MenuItemRowProps {
  item: MenuItem;
  /** Position relative to the selected item: 0 is selected, negative sits above the bar. */
  offset: number;
  elementRef: RefCallback<HTMLElement>;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  /** Keyboard focus only. Focus from a mouse press must not move the list mid-click. */
  onKeyboardFocus: () => void;
}

export function MenuItemRow({
  item,
  offset,
  elementRef,
  onClick,
  onKeyboardFocus,
}: MenuItemRowProps) {
  const { action } = item;
  const newTab = action.kind === 'link' && action.newTab;

  const shared = {
    className: styles.item,
    'data-position': offset === 0 ? 'current' : offset < 0 ? 'before' : 'after',
    style: { '--offset': offset },
    tabIndex: offset === 0 ? 0 : -1,
    onClick,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(':focus-visible')) onKeyboardFocus();
    },
  };

  const content = (
    <span className={styles.inner} data-shake="">
      <Icon icon={item.icon} className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.title}>
          {item.title}
          {item.badge && (
            <span className={styles.badge}>
              <span className="sr-only">, </span>
              {item.badge}
            </span>
          )}
        </span>
        {/* The name is all of the visible text, so voice control can match what's on screen. */}
        <span className="sr-only">. </span>
        <span className={styles.description}>
          {item.description}
          {newTab && <span className="sr-only"> (opens in a new tab)</span>}
        </span>
      </span>
    </span>
  );

  if (action.kind === 'link' || action.kind === 'embed') {
    return (
      <a
        {...shared}
        ref={elementRef}
        href={action.href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button {...shared} ref={elementRef} type="button" aria-disabled={item.disabled || undefined}>
      {content}
    </button>
  );
}
