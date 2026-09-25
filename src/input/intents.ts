export type Direction = 'up' | 'down' | 'left' | 'right';
export type InputSource = 'keyboard' | 'wheel' | 'touch' | 'gamepad';

/** A device-independent request. Every input source is translated into these. */
export type Intent =
  | { type: 'move'; direction: Direction; source: InputSource }
  | { type: 'jump'; to: 'first' | 'last'; source: InputSource }
  | { type: 'confirm'; source: InputSource }
  | { type: 'back'; source: InputSource }
  /** Gamepad Select/View/Share or Guide: leave whatever is open and return to the menu. */
  | { type: 'home'; source: InputSource };

/** Returns true when the intent was handled, so keyboard events can be `preventDefault`-ed. */
export type IntentHandler = (intent: Intent) => boolean;
