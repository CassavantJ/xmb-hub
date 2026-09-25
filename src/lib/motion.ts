import { useLayoutEffect, useSyncExternalStore } from 'react';

import type { MotionChoice } from '../settings/preferences';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToSystemMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToSystemMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
  );
}

/**
 * Resolves the Motion setting against the OS preference and exposes the result as
 * `data-motion` on the root element, which zeroes every transition duration in CSS.
 */
export function useReducedMotion(choice: MotionChoice): boolean {
  const systemReduced = useSystemReducedMotion();
  const reduced = choice === 'reduced' || (choice === 'system' && systemReduced);

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  return reduced;
}

/** For code outside React, e.g. one-off Web Animations. */
export function isReducedMotion(): boolean {
  return document.documentElement.dataset.motion === 'reduced';
}
