import { describe, expect, it } from 'vitest';

import { contrastRatio, type Rgb } from './color';
import { backgroundTop, resolveTheme, THEMES, themeForMonth } from './palette';

const WHITE: Rgb = [1, 1, 1];
/** --text-muted is white at 82% opacity. */
const mutedOver = (background: Rgb): Rgb =>
  background.map((channel) => 0.82 + 0.18 * channel) as unknown as Rgb;

describe('palette', () => {
  it('has one theme per month', () => {
    expect(THEMES).toHaveLength(12);
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(12);
  });

  it('picks the theme for the current month', () => {
    expect(themeForMonth(0).id).toBe('silver');
    expect(themeForMonth(8).id).toBe('purple');
    expect(themeForMonth(11).id).toBe('red');
  });

  it('lets a pinned color override the month', () => {
    expect(resolveTheme('monthly', 8).id).toBe('purple');
    expect(resolveTheme('teal', 8).id).toBe('teal');
  });

  // The lightest background stop is the worst case for white text.
  it.each(THEMES)('$name keeps text readable (WCAG AA)', (theme) => {
    const background = backgroundTop(theme);
    expect(contrastRatio(WHITE, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(mutedOver(background), background)).toBeGreaterThanOrEqual(4.5);
  });
});
