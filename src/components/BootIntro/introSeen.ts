import { readStorage, writeStorage } from '../../lib/storage';

const KEY = 'xmb-hub:intro-seen';

export function hasSeenIntro(): boolean {
  return readStorage(KEY) === '1';
}

export function markIntroSeen(): void {
  writeStorage(KEY, '1');
}
