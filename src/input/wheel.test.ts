import { describe, expect, it } from 'vitest';

import { createWheelTranslator, type WheelSample } from './wheel';

const sample = (overrides: Partial<WheelSample>): WheelSample => ({
  deltaX: 0,
  deltaY: 0,
  deltaMode: 0,
  shiftKey: false,
  timeStamp: 0,
  ...overrides,
});

const move = (direction: string) => ({ type: 'move', direction, source: 'wheel' });

describe('createWheelTranslator', () => {
  it('moves one step per mouse-wheel notch', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 100 }))).toEqual(move('down'));
    expect(translate(sample({ deltaY: -100, timeStamp: 200 }))).toEqual(move('up'));
  });

  it('accumulates small trackpad deltas', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 25, timeStamp: 0 }))).toBeNull();
    expect(translate(sample({ deltaY: 25, timeStamp: 16 }))).toBeNull();
    expect(translate(sample({ deltaY: 25, timeStamp: 32 }))).toEqual(move('down'));
  });

  it('starts a new gesture after a pause', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 40, timeStamp: 0 }))).toBeNull();
    expect(translate(sample({ deltaY: 40, timeStamp: 500 }))).toBeNull();
  });

  it('limits how fast steps can repeat', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 100, timeStamp: 0 }))).toEqual(move('down'));
    expect(translate(sample({ deltaY: 100, timeStamp: 30 }))).toBeNull();
    expect(translate(sample({ deltaY: 100, timeStamp: 100 }))).toEqual(move('down'));
  });

  it('lets a reversal step immediately', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 100, timeStamp: 0 }))).toEqual(move('down'));
    expect(translate(sample({ deltaY: -100, timeStamp: 30 }))).toEqual(move('up'));
  });

  it('moves categories with horizontal scroll or Shift+wheel', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaX: 100 }))).toEqual(move('right'));
    expect(translate(sample({ deltaY: -100, shiftKey: true, timeStamp: 200 }))).toEqual(
      move('left'),
    );
  });

  it('scales line-based deltas', () => {
    const translate = createWheelTranslator();
    expect(translate(sample({ deltaY: 3, deltaMode: 1 }))).toEqual(move('down'));
  });
});
