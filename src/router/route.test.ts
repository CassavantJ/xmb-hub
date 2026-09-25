import { describe, expect, it } from 'vitest';

import { HUB_STATE, isHubEntry, parseRoute } from './route';

describe('parseRoute', () => {
  it('parses embedded app paths', () => {
    expect(parseRoute('/app/palette')).toEqual({ kind: 'app', appId: 'palette' });
    expect(parseRoute('/app/lift-log/')).toEqual({ kind: 'app', appId: 'lift-log' });
  });

  it('treats everything else as the menu', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' });
    expect(parseRoute('/app/')).toEqual({ kind: 'home' });
    expect(parseRoute('/app/Bad_Id')).toEqual({ kind: 'home' });
    expect(parseRoute('/app/palette/extra')).toEqual({ kind: 'home' });
  });
});

describe('isHubEntry', () => {
  it('recognizes entries the hub pushed', () => {
    expect(isHubEntry(HUB_STATE)).toBe(true);
    expect(isHubEntry(null)).toBe(false);
    expect(isHubEntry({ other: 1 })).toBe(false);
  });
});
