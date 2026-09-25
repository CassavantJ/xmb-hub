export function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  );
}

/** Whether the browser will click the focused element itself for this key. */
export function activatesNatively(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof Element)) return false;
  const selector = key === 'Enter' ? 'a[href], button, summary' : 'button, summary';
  return target.closest(selector) !== null;
}

/** Areas that scroll natively (e.g. long panel content) keep their own wheel and touch behavior. */
export function isInNativeScroll(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-native-scroll]') !== null;
}

export function isInSwipeArea(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-swipe-area]') !== null;
}
