import { useEffect, useRef, type MouseEvent } from 'react';

import { playSound } from '../../audio/sounds';
import { site } from '../../data/site';
import { Icon } from '../../icons/Icon';
import { useIntentLayer } from '../../input/useIntentLayer';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import styles from './NotFound.module.css';

interface NotFoundProps {
  /** In the app, return to the menu without a reload. Omitted on the static 404 page. */
  onHome?: () => void;
}

/** A console-style system message for addresses that don't exist. */
export function NotFound({ onHome }: NotFoundProps) {
  const homeRef = useRef<HTMLAnchorElement>(null);
  useDocumentTitle(`Not found · ${site.name}`);

  const goHome = () => {
    playSound('back');
    if (onHome) onHome();
    else window.location.assign('/');
  };

  // Focus the only action, so Enter (or a controller) works straight away.
  useEffect(() => {
    homeRef.current?.focus({ preventScroll: true });
  }, []);

  // Any confirm, back or home input returns to the menu; moves have nowhere to go.
  useIntentLayer((intent) => {
    if (intent.type === 'move' || intent.type === 'jump') return true;
    goHome();
    return true;
  });

  return (
    <main className={styles.page}>
      <section className={styles.message} aria-labelledby="not-found-title">
        <Icon icon="alert" className={styles.icon} />
        <h1 id="not-found-title" className={styles.title}>
          Page not found
        </h1>
        <p className={styles.text}>
          There’s nothing at <span className={styles.path}>{window.location.pathname}</span>. The
          link may be wrong, or the page may have moved.
        </p>
        <a
          ref={homeRef}
          href="/"
          className={styles.home}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            goHome();
          }}
        >
          <Icon icon="home" className={styles.homeIcon} />
          Return to the menu
        </a>
        <p className={styles.hint}>Enter, Esc or any controller button works too.</p>
      </section>
    </main>
  );
}
