import { useCallback, useEffect, useState } from 'react';

import { HUB_STATE, isHubEntry, parseRoute } from './route';

/** A two-route History API router; the hub doesn't need a routing library. */
export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (options?.replace) window.history.replaceState(null, '', path);
    else window.history.pushState(HUB_STATE, '', path);
    setRoute(parseRoute(path));
  }, []);

  /** Goes back if the hub pushed the current entry (e.g. after opening an app), else replaces it. */
  const back = useCallback(
    (fallback: string) => {
      if (isHubEntry(window.history.state)) window.history.back();
      else navigate(fallback, { replace: true });
    },
    [navigate],
  );

  return { route, navigate, back };
}
