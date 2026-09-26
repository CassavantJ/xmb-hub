import { existsSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { isSvgPath } from '../icons/icons';
import { apps } from './apps';
import { site } from './site';

const publicDir = new URL('../../public/', import.meta.url);

/** An https URL, or a root-relative path on this site. */
function isHubUrl(url: string): boolean {
  if (url.startsWith('/')) return !url.startsWith('//');
  return URL.canParse(url) && new URL(url).protocol === 'https:';
}

describe('app registry', () => {
  it('has unique ids', () => {
    const ids = apps.map((app) => app.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });

  describe.each(apps)('$id', (app) => {
    it('has a kebab-case id', () => {
      expect(app.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });

    it('has a title and a one-line description under 90 characters', () => {
      expect(app.title.trim()).not.toBe('');
      expect(app.description.trim()).not.toBe('');
      expect(app.description).not.toContain('\n');
      expect(app.description.length).toBeLessThanOrEqual(90);
    });

    it('links to an https URL or a site path', () => {
      expect(isHubUrl(app.url)).toBe(true);
    });

    it.runIf(app.repo !== undefined)('has an https repo URL', () => {
      expect(app.repo).toMatch(/^https:\/\//);
    });

    // The Content Security Policy (src/seo/siteFiles.ts) only allows framing these.
    it.runIf(app.openMode === 'embedded')(`embeds an app on a *.${site.domain} subdomain`, () => {
      expect(new URL(app.url).protocol).toBe('https:');
      expect(new URL(app.url).hostname.endsWith(`.${site.domain}`)).toBe(true);
    });

    it.runIf(isSvgPath(app.icon))('uses an SVG icon that exists in public/', () => {
      expect(existsSync(new URL(`.${app.icon}`, publicDir))).toBe(true);
    });
  });
});
