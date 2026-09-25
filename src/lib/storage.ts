/**
 * localStorage that never throws. Private windows, disabled storage and blocked site data all
 * make it throw or vanish; the hub treats that as "nothing saved" and keeps working.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Not persisted; the in-memory value still applies for this visit.
  }
}
