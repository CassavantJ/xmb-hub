import type { Intent } from './intents';

/** Movement below this is a tap; beyond it the gesture locks to one axis. */
const LOCK_PX = 12;
/** Finger travel per step. Steps fire during the drag, so the menu tracks the finger. */
const STEP_PX = { x: 64, y: 52 } as const;

export interface SwipeTracker {
  start(x: number, y: number): void;
  move(x: number, y: number): Intent[];
  /** Ends the gesture. Returns true if it was a swipe rather than a tap. */
  end(): boolean;
}

export function createSwipeTracker(): SwipeTracker {
  let origin: { x: number; y: number } | null = null;
  let anchor = { x: 0, y: 0 };
  let axis: 'x' | 'y' | null = null;

  return {
    start(x, y) {
      origin = { x, y };
      anchor = { x, y };
      axis = null;
    },

    move(x, y) {
      if (!origin) return [];
      if (!axis) {
        const dx = x - origin.x;
        const dy = y - origin.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_PX) return [];
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }

      const step = STEP_PX[axis];
      const travel = axis === 'x' ? x - anchor.x : y - anchor.y;
      const steps = Math.trunc(travel / step);
      if (steps === 0) return [];

      if (axis === 'x') anchor.x += steps * step;
      else anchor.y += steps * step;

      // Content follows the finger: dragging up or left pulls the next item or category into place.
      const direction = axis === 'x' ? (steps < 0 ? 'right' : 'left') : steps < 0 ? 'down' : 'up';
      return Array.from({ length: Math.abs(steps) }, () => ({
        type: 'move' as const,
        direction,
        source: 'touch' as const,
      }));
    },

    end() {
      const swiped = axis !== null;
      origin = null;
      axis = null;
      return swiped;
    },
  };
}
