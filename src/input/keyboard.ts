import type { Intent } from './intents';

const KEY_INTENTS: Record<string, Intent> = {
  ArrowUp: { type: 'move', direction: 'up', source: 'keyboard' },
  ArrowDown: { type: 'move', direction: 'down', source: 'keyboard' },
  ArrowLeft: { type: 'move', direction: 'left', source: 'keyboard' },
  ArrowRight: { type: 'move', direction: 'right', source: 'keyboard' },
  Home: { type: 'jump', to: 'first', source: 'keyboard' },
  End: { type: 'jump', to: 'last', source: 'keyboard' },
  Enter: { type: 'confirm', source: 'keyboard' },
  ' ': { type: 'confirm', source: 'keyboard' },
  Escape: { type: 'back', source: 'keyboard' },
  Backspace: { type: 'back', source: 'keyboard' },
};

export function keyToIntent(key: string): Intent | null {
  return KEY_INTENTS[key] ?? null;
}
