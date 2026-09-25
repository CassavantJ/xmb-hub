import type { Direction, Intent } from './intents';

/** Button indices in the W3C "standard" mapping. South/east are A/B on Xbox, Cross/Circle on PlayStation. */
const BUTTON = {
  south: 0,
  east: 1,
  select: 8,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  guide: 16,
} as const;

/** Stick hysteresis: engage past ON, release below OFF, so a resting stick can't flicker. */
const STICK_ON = 0.5;
const STICK_OFF = 0.3;
const REPEAT_DELAY_MS = 380;
const REPEAT_INTERVAL_MS = 110;

type Control = Direction | 'confirm' | 'back' | 'home';
type AxisState = -1 | 0 | 1;

/** The parts of `Gamepad` the reader uses, so tests can pass plain objects. */
export interface GamepadLike {
  readonly index: number;
  readonly connected: boolean;
  readonly mapping: string;
  readonly buttons: readonly { readonly pressed: boolean }[];
  readonly axes: readonly number[];
}

/**
 * Polls gamepads into intents. Buttons fire once per press; held directions (d-pad or left stick)
 * repeat like a held key. Input from every connected pad is merged.
 */
export class GamepadReader {
  /** Held controls, with the time a held direction next repeats. */
  readonly #held = new Map<Control, number>();
  readonly #sticks = new Map<number, { x: AxisState; y: AxisState }>();

  update(pads: readonly (GamepadLike | null)[], now: number): Intent[] {
    const down = new Set<Control>();
    for (const pad of pads) {
      if (pad?.connected) this.#collect(pad, down);
    }

    const intents: Intent[] = [];
    for (const control of down) {
      const repeatAt = this.#held.get(control);
      if (repeatAt === undefined) {
        intents.push(toIntent(control));
        this.#held.set(control, now + REPEAT_DELAY_MS);
      } else if (isDirection(control) && now >= repeatAt) {
        intents.push(toIntent(control));
        this.#held.set(control, now + REPEAT_INTERVAL_MS);
      }
    }
    for (const control of this.#held.keys()) {
      if (!down.has(control)) this.#held.delete(control);
    }
    return intents;
  }

  #collect(pad: GamepadLike, down: Set<Control>): void {
    const pressed = (index: number) => pad.buttons[index]?.pressed === true;
    if (pressed(BUTTON.south)) down.add('confirm');
    if (pressed(BUTTON.east)) down.add('back');

    // Only the standard mapping guarantees what the other buttons mean.
    if (pad.mapping === 'standard') {
      if (pressed(BUTTON.select) || pressed(BUTTON.guide)) down.add('home');
      if (pressed(BUTTON.dpadUp)) down.add('up');
      if (pressed(BUTTON.dpadDown)) down.add('down');
      if (pressed(BUTTON.dpadLeft)) down.add('left');
      if (pressed(BUTTON.dpadRight)) down.add('right');
    }

    const stick = this.#readStick(pad);
    if (stick.x !== 0) down.add(stick.x < 0 ? 'left' : 'right');
    if (stick.y !== 0) down.add(stick.y < 0 ? 'up' : 'down');
  }

  #readStick(pad: GamepadLike): { x: AxisState; y: AxisState } {
    const x = pad.axes[0] ?? 0;
    const y = pad.axes[1] ?? 0;
    const previous = this.#sticks.get(pad.index) ?? { x: 0, y: 0 };
    let next = { x: axisState(x, previous.x), y: axisState(y, previous.y) };
    // On a diagonal, keep only the dominant axis so the menu doesn't move two ways at once.
    if (next.x !== 0 && next.y !== 0) {
      next = Math.abs(x) >= Math.abs(y) ? { x: next.x, y: 0 } : { x: 0, y: next.y };
    }
    this.#sticks.set(pad.index, next);
    return next;
  }
}

/**
 * Polls gamepads once per animation frame while any is connected, and dispatches their intents.
 * rAF also pauses on its own while the tab is hidden. Returns a function that stops polling.
 */
export function pollGamepads(dispatch: (intent: Intent) => void): () => void {
  const reader = new GamepadReader();
  let frame = 0;

  const tick = (now: number) => {
    const pads = navigator.getGamepads();
    for (const intent of reader.update(pads, now)) dispatch(intent);
    frame = pads.some((pad) => pad?.connected) ? requestAnimationFrame(tick) : 0;
  };
  const start = () => {
    if (frame === 0) frame = requestAnimationFrame(tick);
  };

  window.addEventListener('gamepadconnected', start);
  start(); // A pad may already be connected, e.g. after a reload.
  return () => {
    window.removeEventListener('gamepadconnected', start);
    cancelAnimationFrame(frame);
  };
}

function axisState(value: number, previous: AxisState): AxisState {
  if (previous !== 0 && Math.sign(value) === previous && Math.abs(value) > STICK_OFF) {
    return previous;
  }
  if (Math.abs(value) >= STICK_ON) return value > 0 ? 1 : -1;
  return 0;
}

function isDirection(control: Control): control is Direction {
  return control === 'up' || control === 'down' || control === 'left' || control === 'right';
}

function toIntent(control: Control): Intent {
  if (isDirection(control)) return { type: 'move', direction: control, source: 'gamepad' };
  return { type: control, source: 'gamepad' };
}
