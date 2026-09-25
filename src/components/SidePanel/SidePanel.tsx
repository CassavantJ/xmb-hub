import { useId, useRef, type ReactNode } from 'react';

import { Icon } from '../../icons/Icon';
import { useIntentLayer } from '../../input/useIntentLayer';
import { moveFocusWithin } from '../../lib/focus';
import { activateElement } from '../../lib/links';
import { useModalDialog } from '../Dialog/useModalDialog';
import styles from './SidePanel.module.css';

interface SidePanelProps {
  title: string;
  onClose: () => void;
  /** Mark navigable children with `data-panel-item`; up/down and the gamepad move between them. */
  children: ReactNode;
}

/** An XMB-style panel that slides in from the right over a dimmed menu. */
export function SidePanel({ title, onClose, children }: SidePanelProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useModalDialog(ref, onClose, () => ref.current?.querySelector<HTMLElement>('[data-panel-item]'));

  useIntentLayer((intent) => {
    switch (intent.type) {
      case 'back':
      case 'home':
        onClose();
        return true;
      case 'move':
        if (intent.direction === 'left') onClose();
        else if (intent.direction !== 'right') {
          moveFocusWithin(ref.current, intent.direction === 'up' ? -1 : 1);
        }
        return true;
      case 'jump':
        moveFocusWithin(ref.current, intent.to);
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
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.sheet}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
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
