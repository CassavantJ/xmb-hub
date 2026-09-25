import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

import { playSound } from '../../audio/sounds';
import { useIntentLayer } from '../../input/useIntentLayer';
import type { MenuPosition } from '../../menu/menu';
import type { MenuAction, MenuCategory } from '../../menu/types';
import { CategoryBar } from './CategoryBar';
import { playDenied } from './feedback';
import { ItemColumn } from './ItemColumn';
import { createSelection, selectedItem, withCategory, withItem, type Selection } from './selection';
import styles from './Xmb.module.css';

interface XmbProps {
  menu: readonly MenuCategory[];
  initial: MenuPosition;
  /** Opens an item. Plain links clicked with the mouse are followed by the browser instead. */
  onOpen: (action: MenuAction) => void;
  /** Held slightly offset while the intro plays, then eased into place. */
  entering?: boolean;
}

const itemKey = (category: number, item: number) => `${category}:${item}`;

export function Xmb({ menu, initial, onOpen, entering = false }: XmbProps) {
  const counts = useMemo(() => menu.map((category) => category.items.length), [menu]);
  const [selection, setSelection] = useState(() =>
    createSelection(counts, initial.category, initial.item),
  );
  // Several intents can land before React re-renders (a fast swipe, one gamepad frame), so input
  // handlers read and write this ref rather than the render-time `selection`.
  const latest = useRef(selection);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemElements = useRef(new Map<string, HTMLElement>());
  const focusFollows = useRef(false);

  // Moves from keys, wheel, touch and gamepad carry DOM focus along with the selection, so screen
  // readers announce the new item. Focus is only taken if it's already in the menu (or nowhere).
  useLayoutEffect(() => {
    if (!focusFollows.current) return;
    focusFollows.current = false;
    const active = document.activeElement;
    if (active && active !== document.body && !rootRef.current?.contains(active)) return;
    const key = itemKey(selection.category, selectedItem(selection));
    itemElements.current.get(key)?.focus({ preventScroll: true });
  }, [selection]);

  /**
   * The one place selection changes.
   * - `navigate`: keys, wheel, touch, gamepad. Focus follows and a tick plays.
   * - `point`: a mouse click on a category. A tick plays.
   * - `sync`: silently follow keyboard focus, or a click that's about to open an item.
   */
  const update = (
    change: (current: Selection) => Selection,
    cause: 'navigate' | 'point' | 'sync',
  ) => {
    const next = change(latest.current);
    if (next === latest.current) return;
    latest.current = next;
    if (cause === 'navigate') focusFollows.current = true;
    if (cause !== 'sync') playSound('move');
    setSelection(next);
  };

  const activate = (category: number, item: number) => {
    const entry = menu[category]?.items[item];
    if (!entry) return;
    if (entry.disabled) {
      playDenied(itemElements.current.get(itemKey(category, item)));
      return;
    }
    playSound('confirm');
    onOpen(entry.action);
  };

  useIntentLayer((intent) => {
    switch (intent.type) {
      case 'move': {
        const step = intent.direction === 'up' || intent.direction === 'left' ? -1 : 1;
        const horizontal = intent.direction === 'left' || intent.direction === 'right';
        update(
          (current) =>
            horizontal
              ? withCategory(current, current.category + step, counts)
              : withItem(current, selectedItem(current) + step, counts),
          'navigate',
        );
        return true;
      }
      case 'jump':
        update(
          (current) => withItem(current, intent.to === 'first' ? 0 : Infinity, counts),
          'navigate',
        );
        return true;
      case 'confirm':
        activate(latest.current.category, selectedItem(latest.current));
        return true;
      case 'back':
      case 'home':
        return false;
    }
  });

  const handleItemClick = (category: number, item: number, event: MouseEvent<HTMLElement>) => {
    const entry = menu[category]?.items[item];
    if (!entry) return;
    update((current) => withItem(current, item, counts, category), 'sync');
    if (entry.disabled) {
      event.preventDefault();
      playDenied(event.currentTarget);
      return;
    }
    playSound('confirm');
    const { action } = entry;
    // Real links: let the browser handle them, including Ctrl/Cmd/Shift-click.
    if (action.kind === 'link') return;
    if (action.kind === 'embed' && isModifiedClick(event)) return;
    event.preventDefault();
    onOpen(action);
  };

  return (
    <div ref={rootRef} className={styles.xmb} data-swipe-area="" data-entering={entering}>
      <CategoryBar
        categories={menu}
        selected={selection.category}
        onSelect={(category) => {
          update((current) => withCategory(current, category, counts), 'point');
        }}
      />
      {menu.map((category, categoryIndex) => (
        <ItemColumn
          key={category.id}
          category={category}
          offset={categoryIndex - selection.category}
          selected={selection.items[categoryIndex] ?? 0}
          itemRef={(item) => (element) => {
            const key = itemKey(categoryIndex, item);
            if (element) itemElements.current.set(key, element);
            return () => {
              itemElements.current.delete(key);
            };
          }}
          onItemClick={(item, event) => {
            handleItemClick(categoryIndex, item, event);
          }}
          onItemKeyboardFocus={(item) => {
            update((current) => withItem(current, item, counts, categoryIndex), 'sync');
          }}
        />
      ))}
    </div>
  );
}

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
