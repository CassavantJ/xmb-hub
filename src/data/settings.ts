import type { IconName } from '../icons/icons';

export type SettingId = 'theme' | 'sound' | 'motion' | 'intro';

export interface SettingEntry {
  id: SettingId;
  title: string;
  description: string;
  icon: IconName;
}

/** Items in the Settings category. Phase 4 wires each one to its control. */
export const settings: readonly SettingEntry[] = [
  {
    id: 'theme',
    title: 'Theme Color',
    description: 'Changes with the month. Pick a color to override it.',
    icon: 'palette',
  },
  {
    id: 'sound',
    title: 'Sound',
    description: 'Soft navigation sounds. Off by default.',
    icon: 'volume',
  },
  {
    id: 'motion',
    title: 'Motion',
    description: 'Follows your system setting. Turn animation off here.',
    icon: 'waves',
  },
  {
    id: 'intro',
    title: 'Replay Intro',
    description: 'Play the startup animation again on your next visit.',
    icon: 'rotate-ccw',
  },
];
