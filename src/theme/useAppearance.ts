import { useMemo } from 'react';

import { useReducedMotion } from '../lib/motion';
import { useMonth } from '../lib/useMonth';
import { usePreferences } from '../settings/preferences';
import { resolveTheme, waveTint } from './palette';
import { useThemeVariables } from './useTheme';

/**
 * Applies the visitor's theme and motion settings to the page (shared by the menu and the
 * standalone 404 page) and returns what the background needs.
 */
export function useAppearance() {
  const preferences = usePreferences();
  const reducedMotion = useReducedMotion(preferences.motion);
  const month = useMonth();
  const theme = useMemo(() => resolveTheme(preferences.theme, month), [preferences.theme, month]);
  const tint = useMemo(() => waveTint(theme), [theme]);
  useThemeVariables(theme);
  return { preferences, reducedMotion, waveTint: tint };
}
