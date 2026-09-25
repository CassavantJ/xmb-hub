import { useLayoutEffect, useRef } from 'react';

import { toHex } from './color';
import { backgroundTop, type Theme } from './palette';

/**
 * Writes the theme into the root CSS variables the gradients read, and the browser's theme color.
 * The variables are registered with @property in global.css, so theme changes cross-fade.
 */
export function useThemeVariables(theme: Theme): void {
  const hue = useRef<number | null>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    // Take the short way around the color wheel (e.g. pink 355° → red 25° goes via 0°, not green).
    const previous = hue.current ?? theme.h;
    const h = theme.h + 360 * Math.round((previous - theme.h) / 360);
    hue.current = h;

    root.style.setProperty('--theme-l', String(theme.l));
    root.style.setProperty('--theme-c', String(theme.c));
    root.style.setProperty('--theme-h', String(h));
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', toHex(backgroundTop(theme)));

    // Enable the cross-fade only after the first theme is applied, so page load doesn't animate.
    if (!('themeReady' in root.dataset)) {
      requestAnimationFrame(() => {
        root.dataset.themeReady = '';
      });
    }
  }, [theme]);
}
