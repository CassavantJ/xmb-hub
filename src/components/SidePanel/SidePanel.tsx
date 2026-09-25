import { useId, useRef, type ReactNode } from 'react';

import { playSound } from '../../audio/sounds';
import { Icon } from '../../icons/Icon';
import { useIntentLayer } from '../../input/useIntentLayer';
import { moveFocusWithin } from '../../lib/focus';
import { activateElement } from '../../lib/links';
import { useModalDialog } from '../Dialog/useModalDialog';
import styles from './SidePanel.module.css';

interface SidePanelProps {
  title: string;
  onClose: () => void;
  /**
   * Mark navigable children with `data-panel-item`; up/down and the gamepad move between them.
   * Focus starts on the one marked `data-panel-initial`, else the first.
   */
  children: ReactNode;
}

/** An XMB-style panel that slides in from the right over a dimmed menu. */
export function SidePanel({ title, onClose, children }: SidePanelProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const close = () => {
    playSound('back');
    onClose();
  };
  const move = (to: number | 'first' | 'last') => {
    if (moveFocusWithin(ref.current, to)) playSound('move');
  };

  useModalDialog(
    ref,
    close,
    () =>
      ref.current?.querySelector<HTMLElement>('[data-panel-initial]') ??
      ref.current?.querySelector<HTMLElement>('[data-panel-item]'),
  );

  useIntentLayer((intent) => {
    switch (intent.type) {
      case 'back':
      case 'home':
        close();
        return true;
      case 'move':
        if (intent.direction === 'left') close();
        else if (intent.direction !== 'right') move(intent.direction === 'up' ? -1 : 1);
        return true;
      case 'jump':
        move(intent.to);
        return true;
      case 'confirm':
        if (ref.current?.contains(document.activeElement)) activateElement(document.activeElement);
        return true;
    }
  });

  return (
    // Clicks on the dialog element itself land on the backdrop. Esc/Back is the keyboard equivalent.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={styles.panel}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className={styles.sheet}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={close}>
            <Icon icon="x" className={styles.closeIcon} />
          </button>
        </header>
        <div className={styles.body} data-native-scroll="">
          {children}
        </div>
      </div>
    </dialog>
  );
}
