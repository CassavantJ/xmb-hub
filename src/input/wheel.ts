import type { Intent } from './intents';

const LINE_PX = 40;
const PAGE_PX = 800;
/** One event at least this large is a mouse-wheel notch: exactly one step. */
const NOTCH_PX = 50;
/** Smaller trackpad deltas accumulate until they reach this. */
const THRESHOLD_PX = 60;
/** A pause longer than this starts a new gesture. */
const GESTURE_GAP_MS = 150;
/** Minimum time between steps. Tames trackpad momentum and fast wheel spins. */
const MIN_STEP_MS = 70;

export interface WheelSample {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  shiftKey: boolean;
  timeStamp: number;
}

/** Turns wheel events into one-step moves. Vertical moves items; horizontal (or Shift) moves categories. */
export function createWheelTranslator(): (sample: WheelSample) => Intent | null {
  let accumulated = 0;
  let axis: 'x' | 'y' = 'y';
  /** Sign of the last step on the current axis (0 if none yet). */
  let heading = 0;
  let lastEvent = -Infinity;
  let lastStep = -Infinity;

  return (sample) => {
    const scale = sample.deltaMode === 1 ? LINE_PX : sample.deltaMode === 2 ? PAGE_PX : 1;
    let dx = sample.deltaX * scale;
    let dy = sample.deltaY * scale;
    if (sample.shiftKey && dx === 0) [dx, dy] = [dy, 0];

    const eventAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    const delta = eventAxis === 'x' ? dx : dy;
    if (eventAxis !== axis) heading = 0;
    // Reversing direction is never momentum: start over and allow an immediate step.
    const reversed = delta !== 0 && Math.sign(delta) === -(Math.sign(accumulated) || heading);
    if (reversed) lastStep = -Infinity;
    if (sample.timeStamp - lastEvent > GESTURE_GAP_MS || eventAxis !== axis || reversed) {
      accumulated = 0;
    }
    lastEvent = sample.timeStamp;
    axis = eventAxis;
    accumulated += delta;

    if (Math.abs(delta) < NOTCH_PX && Math.abs(accumulated) < THRESHOLD_PX) return null;
    if (sample.timeStamp - lastStep < MIN_STEP_MS) return null;

    const forward = accumulated > 0;
    heading = forward ? 1 : -1;
    accumulated = 0;
    lastStep = sample.timeStamp;
    const direction = axis === 'x' ? (forward ? 'right' : 'left') : forward ? 'down' : 'up';
    return { type: 'move', direction, source: 'wheel' };
  };
}
