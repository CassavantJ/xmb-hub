import { describe, expect, it } from 'vitest';

import { DEFAULT_PREFERENCES, parsePreferences } from './preferences';

describe('parsePreferences', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });

  it('defaults to monthly theme, sound and music off, system motion', () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      theme: 'monthly',
      sound: false,
      music: false,
      motion: 'system',
    });
  });

  it('survives corrupt JSON', () => {
    expect(parsePreferences('{not json')).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences('42')).toEqual(DEFAULT_PREFERENCES);
  });

  it('reads valid values', () => {
    expect(
      parsePreferences('{"theme":"teal","sound":true,"music":true,"motion":"reduced"}'),
    ).toEqual({ theme: 'teal', sound: true, music: true, motion: 'reduced' });
  });

  it('replaces only the fields that are invalid', () => {
    expect(parsePreferences('{"theme":"plaid","sound":true,"music":"yes","motion":5}')).toEqual({
      theme: 'monthly',
      sound: true,
      music: false,
      motion: 'system',
    });
  });
});
