/**
 * Moves focus between a container's `[data-panel-item]` elements, clamped at both ends.
 * Returns whether focus actually moved.
 */
export function moveFocusWithin(
  container: HTMLElement | null,
  to: number | 'first' | 'last',
): boolean {
  if (!container) return false;
  const items = [...container.querySelectorAll<HTMLElement>('[data-panel-item]')];
  if (items.length === 0) return false;
  const current = items.findIndex((item) => item === document.activeElement);
  const target =
    to === 'first' ? 0 : to === 'last' ? items.length - 1 : current === -1 ? 0 : current + to;
  const next = Math.min(Math.max(target, 0), items.length - 1);
  if (next === current) return false;
  items[next]?.focus();
  return true;
}
