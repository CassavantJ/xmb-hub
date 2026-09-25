import { useEffect, useState } from 'react';

const HOUR_MS = 60 * 60 * 1000;

/** The current month (0-based). Re-checked hourly and whenever the tab becomes visible. */
export function useMonth(): number {
  const [month, setMonth] = useState(() => new Date().getMonth());

  useEffect(() => {
    const check = () => {
      setMonth(new Date().getMonth());
    };
    const timer = window.setInterval(check, HOUR_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  return month;
}
