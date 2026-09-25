import { existsSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { isSvgPath } from '../icons/icons';
import { profile } from './profile';

const publicDir = new URL('../../public/', import.meta.url);

describe('profile', () => {
  it('has a one-line summary and an about text', () => {
    expect(profile.summary).not.toContain('\n');
    expect(profile.summary.length).toBeLessThanOrEqual(90);
    expect(profile.about.length).toBeGreaterThan(0);
  });

  it.each(profile.links)('$title links over https or mailto', (link) => {
    expect(link.url).toMatch(/^(https:\/\/|mailto:)/);
  });

  it.each(profile.links.filter((link) => isSvgPath(link.icon)))(
    '$title uses an SVG icon that exists in public/',
    (link) => {
      expect(existsSync(new URL(`.${link.icon}`, publicDir))).toBe(true);
    },
  );
});
