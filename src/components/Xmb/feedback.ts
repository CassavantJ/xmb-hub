const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-3px)' },
  { transform: 'translateX(0)' },
];
const PULSE: Keyframe[] = [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }];

/** A short shake (a dim pulse with reduced motion) on an item that can't be opened. */
export function playDenied(item: Element | null | undefined): void {
  const target = item?.querySelector('[data-shake]');
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.animate(reduce ? PULSE : SHAKE, { duration: 320, easing: 'ease-out' });
}
