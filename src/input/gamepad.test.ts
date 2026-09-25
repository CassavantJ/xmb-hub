import { describe, expect, it } from 'vitest';

import { GamepadReader, type GamepadLike } from './gamepad';

function pad({
  pressed = [],
  axes = [0, 0],
  mapping = 'standard',
}: { pressed?: number[]; axes?: number[]; mapping?: string } = {}): GamepadLike {
  return {
    index: 0,
    connected: true,
    mapping,
    buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: pressed.includes(index) })),
    axes,
  };
}

const move = (direction: string) => ({ type: 'move', direction, source: 'gamepad' });

describe('GamepadReader', () => {
  it('fires buttons once per press', () => {
    const reader = new GamepadReader();
    expect(reader.update([pad({ pressed: [0] })], 0)).toEqual([
      { type: 'confirm', source: 'gamepad' },
    ]);
    expect(reader.update([pad({ pressed: [0] })], 1000)).toEqual([]);
    expect(reader.update([pad()], 1016)).toEqual([]);
    expect(reader.update([pad({ pressed: [0] })], 1032)).toHaveLength(1);
  });

  it('maps B to back and Select or Guide to home', () => {
    const reader = new GamepadReader();
    expect(reader.update([pad({ pressed: [1] })], 0)).toEqual([
      { type: 'back', source: 'gamepad' },
    ]);
    expect(reader.update([pad({ pressed: [8] })], 16)).toEqual([
      { type: 'home', source: 'gamepad' },
    ]);
    reader.update([pad()], 32);
    expect(reader.update([pad({ pressed: [16] })], 48)).toEqual([
      { type: 'home', source: 'gamepad' },
    ]);
  });

  it('repeats a held d-pad direction after a delay', () => {
    const reader = new GamepadReader();
    const down = pad({ pressed: [13] });
    expect(reader.update([down], 0)).toEqual([move('down')]);
    expect(reader.update([down], 300)).toEqual([]);
    expect(reader.update([down], 380)).toEqual([move('down')]);
    expect(reader.update([down], 450)).toEqual([]);
    expect(reader.update([down], 490)).toEqual([move('down')]);
  });

  it('reads the left stick with hysteresis', () => {
    const reader = new GamepadReader();
    expect(reader.update([pad({ axes: [0.4, 0] })], 0)).toEqual([]);
    expect(reader.update([pad({ axes: [0.6, 0] })], 16)).toEqual([move('right')]);
    // Drifting back to 0.4 stays engaged (no second press)...
    expect(reader.update([pad({ axes: [0.4, 0] })], 32)).toEqual([]);
    // ...until it drops below the release threshold.
    expect(reader.update([pad({ axes: [0.2, 0] })], 48)).toEqual([]);
    expect(reader.update([pad({ axes: [0.6, 0] })], 64)).toEqual([move('right')]);
  });

  it('keeps only the dominant stick axis on a diagonal', () => {
    const reader = new GamepadReader();
    expect(reader.update([pad({ axes: [0.6, -0.9] })], 0)).toEqual([move('up')]);
  });

  it('ignores d-pad button indices on non-standard mappings', () => {
    const reader = new GamepadReader();
    expect(reader.update([pad({ pressed: [13], mapping: '' })], 0)).toEqual([]);
    expect(reader.update([pad({ pressed: [0], mapping: '' })], 16)).toEqual([
      { type: 'confirm', source: 'gamepad' },
    ]);
  });

  it('skips disconnected and empty slots', () => {
    const reader = new GamepadReader();
    expect(reader.update([null, { ...pad({ pressed: [0] }), connected: false }], 0)).toEqual([]);
  });
});
