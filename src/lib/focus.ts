/** Moves focus between a container's `[data-panel-item]` elements, clamped at both ends. */
export function moveFocusWithin(
  container: HTMLElement | null,
  to: number | 'first' | 'last',
): void {
  if (!container) return;
  const items = [...container.querySelectorAll<HTMLElement>('[data-panel-item]')];
  if (items.length === 0) return;
  const current = items.findIndex((item) => item === document.activeElement);
  const target =
    to === 'first' ? 0 : to === 'last' ? items.length - 1 : current === -1 ? 0 : current + to;
  items[Math.min(Math.max(target, 0), items.length - 1)]?.focus();
}
