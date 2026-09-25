import { describe, expect, it } from 'vitest';

import { createSwipeTracker } from './swipe';

const move = (direction: string) => ({ type: 'move', direction, source: 'touch' });

describe('createSwipeTracker', () => {
  it('treats small movements as a tap', () => {
    const tracker = createSwipeTracker();
    tracker.start(100, 100);
    expect(tracker.move(105, 106)).toEqual([]);
    expect(tracker.end()).toBe(false);
  });

  it('steps through items as the finger travels up', () => {
    const tracker = createSwipeTracker();
    tracker.start(0, 300);
    expect(tracker.move(0, 270)).toEqual([]);
    expect(tracker.move(0, 240)).toEqual([move('down')]);
    expect(tracker.move(0, 140)).toEqual([move('down'), move('down')]);
    expect(tracker.end()).toBe(true);
  });

  it('dragging down goes back up the list', () => {
    const tracker = createSwipeTracker();
    tracker.start(0, 0);
    expect(tracker.move(0, 60)).toEqual([move('up')]);
  });

  it('dragging left selects the next category', () => {
    const tracker = createSwipeTracker();
    tracker.start(300, 0);
    expect(tracker.move(230, 10)).toEqual([move('right')]);
  });

  it('locks to the first axis it moves along', () => {
    const tracker = createSwipeTracker();
    tracker.start(0, 0);
    expect(tracker.move(-20, 0)).toEqual([]);
    // Now locked horizontally: vertical travel is ignored.
    expect(tracker.move(-20, 200)).toEqual([]);
    expect(tracker.move(-70, 200)).toEqual([move('right')]);
  });
});
