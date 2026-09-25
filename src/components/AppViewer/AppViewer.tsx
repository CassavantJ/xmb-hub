import { useId, useRef, useState } from 'react';

import { playSound } from '../../audio/sounds';
import type { AppEntry } from '../../data/schema';
import { site } from '../../data/site';
import { Icon } from '../../icons/Icon';
import { useIntentLayer } from '../../input/useIntentLayer';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useModalDialog } from '../Dialog/useModalDialog';
import styles from './AppViewer.module.css';

interface AppViewerProps {
  app: AppEntry;
  onClose: () => void;
}

/** Full-screen host for `embedded` apps, served at /app/<id>. */
export function AppViewer({ app, onClose }: AppViewerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const titleId = useId();
  const [loaded, setLoaded] = useState(false);

  const close = () => {
    playSound('back');
    onClose();
  };

  // Focus the app itself so it takes keyboard input immediately.
  useModalDialog(ref, close, () => frameRef.current);
  useDocumentTitle(`${app.title} · ${site.name}`);

  useIntentLayer((intent) => {
    // Gamepad B belongs to the embedded app, so gamepads leave with Select/View/Share instead.
    if (intent.type === 'home' || (intent.type === 'back' && intent.source === 'keyboard')) {
      close();
      return true;
    }
    return false;
  });

  return (
    <dialog ref={ref} className={styles.viewer} aria-labelledby={titleId}>
      <header className={styles.bar}>
        <Icon icon={app.icon} className={styles.appIcon} />
        <h2 id={titleId} className={styles.title}>
          {app.title}
        </h2>
        <a className={styles.action} href={app.url} target="_blank" rel="noopener">
          <Icon icon="external-link" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Open in new tab</span>
        </a>
        <button type="button" className={styles.action} onClick={close}>
          <Icon icon="x" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Close</span>
        </button>
      </header>
      <iframe
        ref={frameRef}
        className={styles.frame}
        src={app.url}
        title={app.title}
        allow="fullscreen; gamepad; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
        data-loaded={loaded}
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </dialog>
  );
}
