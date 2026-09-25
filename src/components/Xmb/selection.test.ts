import { describe, expect, it } from 'vitest';

import { createSelection, selectedItem, withCategory, withItem } from './selection';

const counts = [3, 2, 0];

describe('selection', () => {
  it('clamps the starting position', () => {
    expect(createSelection(counts, 9, 9)).toEqual({ category: 2, items: [0, 0, 0] });
    expect(createSelection(counts, 0, 9)).toEqual({ category: 0, items: [2, 0, 0] });
  });

  it('stops at both ends instead of wrapping', () => {
    const start = createSelection(counts, 0, 0);
    expect(withCategory(start, -1, counts)).toBe(start);
    expect(withItem(start, -1, counts)).toBe(start);
    expect(selectedItem(withItem(start, 99, counts))).toBe(2);
  });

  it('remembers the selected item in each category', () => {
    let selection = createSelection(counts, 0, 0);
    selection = withItem(selection, 2, counts);
    selection = withCategory(selection, 1, counts);
    selection = withItem(selection, 1, counts);
    selection = withCategory(selection, 0, counts);
    expect(selectedItem(selection)).toBe(2);
    expect(selection.items).toEqual([2, 1, 0]);
  });

  it('can select an item in another category', () => {
    const selection = withItem(createSelection(counts, 0, 0), 1, counts, 1);
    expect(selection).toEqual({ category: 1, items: [0, 1, 0] });
  });

  it('returns the same object when nothing changes', () => {
    const selection = createSelection(counts, 1, 1);
    expect(withCategory(selection, 1, counts)).toBe(selection);
    expect(withItem(selection, 1, counts)).toBe(selection);
  });
});
