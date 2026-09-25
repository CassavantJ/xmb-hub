import { useSyncExternalStore } from 'react';

import { readStorage, writeStorage } from '../lib/storage';
import { isThemeId, type ThemeChoice } from '../theme/palette';

export type MotionChoice = 'system' | 'reduced' | 'full';

export interface Preferences {
  theme: ThemeChoice;
  sound: boolean;
  music: boolean;
  motion: MotionChoice;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'monthly',
  sound: false,
  music: false,
  motion: 'system',
};

const KEY = 'xmb-hub:preferences';

/** Reads saved preferences field by field, so one bad value doesn't discard the rest. */
export function parsePreferences(raw: string | null): Preferences {
  let saved: unknown = null;
  try {
    saved = raw === null ? null : JSON.parse(raw);
  } catch {
    // Corrupt JSON: fall back to defaults.
  }
  if (typeof saved !== 'object' || saved === null) return DEFAULT_PREFERENCES;
  const { theme, sound, music, motion } = saved as Record<string, unknown>;
  return {
    theme: theme === 'monthly' || isThemeId(theme) ? theme : DEFAULT_PREFERENCES.theme,
    sound: typeof sound === 'boolean' ? sound : DEFAULT_PREFERENCES.sound,
    music: typeof music === 'boolean' ? music : DEFAULT_PREFERENCES.music,
    motion:
      motion === 'system' || motion === 'reduced' || motion === 'full'
        ? motion
        : DEFAULT_PREFERENCES.motion,
  };
}

let current =
  typeof window === 'undefined' ? DEFAULT_PREFERENCES : parsePreferences(readStorage(KEY));
const listeners = new Set<() => void>();

function publish(next: Preferences) {
  current = next;
  for (const listener of listeners) listener();
}

/** A tiny external store: readable from plain modules (sound) and React (`usePreferences`). */
export const preferences = {
  get: (): Preferences => current,

  set: (patch: Partial<Preferences>): void => {
    const next = { ...current, ...patch };
    writeStorage(KEY, JSON.stringify(next));
    publish(next);
  },

  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

// Keep other open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) publish(parsePreferences(event.newValue));
  });
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(preferences.subscribe, preferences.get);
}
