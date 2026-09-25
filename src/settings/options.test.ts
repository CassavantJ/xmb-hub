import { beforeEach, describe, expect, it } from 'vitest';

import { applyChoice, choicesFor, selectedChoice } from './options';
import { DEFAULT_PREFERENCES, preferences } from './preferences';

const context = { month: 8, systemReducedMotion: false };

describe('settings options', () => {
  beforeEach(() => {
    preferences.set(DEFAULT_PREFERENCES);
  });

  it('offers Monthly plus every color for the theme, with swatches', () => {
    const choices = choicesFor('theme', context);
    expect(choices).toHaveLength(13);
    expect(choices[0]?.value).toBe('monthly');
    expect(choices[0]?.label).toContain('Purple');
    expect(choices.every((choice) => choice.swatch !== null)).toBe(true);
  });

  it('describes what "System setting" currently means', () => {
    expect(choicesFor('motion', { ...context, systemReducedMotion: true })[0]?.label).toContain(
      'reduced',
    );
  });

  it('applies and reads back choices', () => {
    applyChoice('sound', 'on');
    applyChoice('theme', 'red');
    applyChoice('motion', 'full');
    const current = preferences.get();
    expect(selectedChoice('sound', current)).toBe('on');
    expect(selectedChoice('theme', current)).toBe('red');
    expect(selectedChoice('motion', current)).toBe('full');
  });

  it('ignores unknown values', () => {
    applyChoice('theme', 'plaid');
    applyChoice('motion', 'sideways');
    expect(preferences.get()).toEqual(DEFAULT_PREFERENCES);
  });
});
