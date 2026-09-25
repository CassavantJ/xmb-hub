import { useEffect, useEffectEvent, useState } from 'react';

import { playSound } from '../../audio/sounds';
import { site } from '../../data/site';
import { useIntentLayer } from '../../input/useIntentLayer';
import styles from './BootIntro.module.css';

interface BootIntroProps {
  /** The overlay has started to fade: bring the menu in underneath it. */
  onReveal: () => void;
  /** The overlay is gone. */
  onDone: () => void;
}

/**
 * A short startup sequence: a line of light sweeps out, the name fades up, the menu appears.
 * Any key, click, tap, swipe or controller button skips it. The menu is rendered (and counted for
 * page-load metrics) underneath the whole time; this overlay only covers it.
 */
export function BootIntro({ onReveal, onDone }: BootIntroProps) {
  const [skipped, setSkipped] = useState(false);

  const skip = () => {
    setSkipped(true);
    onReveal();
  };
  const skipFromListener = useEffectEvent(skip);

  useEffect(() => {
    playSound('boot');
  }, []);

  // Keys and pointers that aren't menu intents (e.g. letter keys) should skip too.
  useEffect(() => {
    const onInput = () => {
      skipFromListener();
    };
    window.addEventListener('keydown', onInput, { capture: true });
    window.addEventListener('pointerdown', onInput, { capture: true });
    return () => {
      window.removeEventListener('keydown', onInput, { capture: true });
      window.removeEventListener('pointerdown', onInput, { capture: true });
    };
  }, []);

  // Swallow intents so the input that skips the intro doesn't also move the menu.
  useIntentLayer(() => {
    skip();
    return true;
  });

  return (
    <div
      className={styles.intro}
      data-skipped={skipped}
      aria-hidden="true"
      // The overlay's own animation is its fade-out. Keying off it (rather than a timer) keeps the
      // menu in step with what's on screen, e.g. in a background tab where animations are paused.
      onAnimationStart={(event) => {
        if (event.target === event.currentTarget) onReveal();
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onDone();
      }}
    >
      <div className={styles.line} />
      <p className={styles.name}>{site.name}</p>
      <p className={styles.hint}>Press any key to skip</p>
    </div>
  );
}
