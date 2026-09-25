import { useEffect, useState } from 'react';

const MINUTE_MS = 60_000;

/** The current time, updated on each minute boundary (and when the tab becomes visible). */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(new Date());
      // Aim just past the next minute boundary so the displayed minute is never behind.
      timer = window.setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);
    };
    timer = window.setTimeout(tick, MINUTE_MS - (Date.now() % MINUTE_MS) + 50);

    // Background tabs throttle timers; catch up as soon as the tab is shown again.
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(timer);
      tick();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return now;
}
