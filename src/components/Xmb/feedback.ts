import { playSound } from '../../audio/sounds';
import { isReducedMotion } from '../../lib/motion';

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-3px)' },
  { transform: 'translateX(0)' },
];
const PULSE: Keyframe[] = [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }];

/** A short shake (a dim pulse with reduced motion) and a low tone on an item that can't open. */
export function playDenied(item: Element | null | undefined): void {
  playSound('denied');
  const target = item?.querySelector('[data-shake]');
  if (!target) return;
  target.animate(isReducedMotion() ? PULSE : SHAKE, { duration: 320, easing: 'ease-out' });
}
