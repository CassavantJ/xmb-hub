import { describe, expect, it } from 'vitest';

import { HUB_STATE, isHubEntry, parseRoute } from './route';

describe('parseRoute', () => {
  it('parses embedded app paths', () => {
    expect(parseRoute('/app/palette')).toEqual({ kind: 'app', appId: 'palette' });
    expect(parseRoute('/app/lift-log/')).toEqual({ kind: 'app', appId: 'lift-log' });
  });

  it('parses the menu', () => {
    expect(parseRoute('/')).toEqual({ kind: 'home' });
    expect(parseRoute('/index.html')).toEqual({ kind: 'home' });
  });

  it('treats everything else as not found', () => {
    expect(parseRoute('/about')).toEqual({ kind: 'notFound' });
    expect(parseRoute('/app/')).toEqual({ kind: 'notFound' });
    expect(parseRoute('/app/Bad_Id')).toEqual({ kind: 'notFound' });
    expect(parseRoute('/app/palette/extra')).toEqual({ kind: 'notFound' });
  });
});

describe('isHubEntry', () => {
  it('recognizes entries the hub pushed', () => {
    expect(isHubEntry(HUB_STATE)).toBe(true);
    expect(isHubEntry(null)).toBe(false);
    expect(isHubEntry({ other: 1 })).toBe(false);
  });
});
