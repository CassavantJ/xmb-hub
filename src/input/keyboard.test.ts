import { describe, expect, it } from 'vitest';

import { keyToIntent } from './keyboard';

describe('keyToIntent', () => {
  it.each([
    ['ArrowUp', { type: 'move', direction: 'up' }],
    ['ArrowRight', { type: 'move', direction: 'right' }],
    ['Home', { type: 'jump', to: 'first' }],
    ['End', { type: 'jump', to: 'last' }],
    ['Enter', { type: 'confirm' }],
    [' ', { type: 'confirm' }],
    ['Escape', { type: 'back' }],
    ['Backspace', { type: 'back' }],
  ])('maps %j', (key, intent) => {
    expect(keyToIntent(key)).toEqual({ ...intent, source: 'keyboard' });
  });

  it('ignores other keys', () => {
    expect(keyToIntent('a')).toBeNull();
    expect(keyToIntent('Tab')).toBeNull();
  });
});
