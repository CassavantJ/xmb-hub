import { useNow } from '../../lib/useNow';
import styles from './Clock.module.css';

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

/** Date and time in the corner, in the visitor's locale. Updates on each minute boundary. */
export function Clock() {
  const now = useNow();
  return (
    <time className={styles.clock} dateTime={now.toISOString()}>
      <span className={styles.date}>{dateFormat.format(now)}</span>
      <span>{timeFormat.format(now)}</span>
    </time>
  );
}
