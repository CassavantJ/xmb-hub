import { describe, expect, it } from 'vitest';

import { contrastRatio, oklchToRgb, toHex } from './color';

const close = (actual: readonly number[], expected: readonly number[]) => {
  actual.forEach((channel, index) => {
    expect(channel).toBeCloseTo(expected[index] ?? NaN, 2);
  });
};

describe('oklchToRgb', () => {
  it('maps the ends of the lightness axis to black and white', () => {
    close(oklchToRgb(0, 0, 0), [0, 0, 0]);
    close(oklchToRgb(1, 0, 0), [1, 1, 1]);
  });

  it('matches known sRGB primaries', () => {
    close(oklchToRgb(0.62796, 0.25768, 29.2339), [1, 0, 0]);
    close(oklchToRgb(0.86644, 0.29483, 142.4953), [0, 1, 0]);
  });

  it('clamps out-of-gamut colors', () => {
    for (const channel of oklchToRgb(0.7, 0.4, 150)) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(1);
    }
  });
});

describe('toHex', () => {
  it('formats channels as a hex color', () => {
    expect(toHex([1, 0.5, 0])).toBe('#ff8000');
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white, either way round', () => {
    expect(contrastRatio([0, 0, 0], [1, 1, 1])).toBeCloseTo(21, 5);
    expect(contrastRatio([1, 1, 1], [0, 0, 0])).toBeCloseTo(21, 5);
  });
});
