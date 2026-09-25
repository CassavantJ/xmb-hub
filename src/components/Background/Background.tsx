import styles from './Background.module.css';

/** The theme gradient. Phase 3 layers the WebGL waves over it; it stays as the fallback. */
export function Background() {
  return <div className={styles.background} aria-hidden="true" />;
}
