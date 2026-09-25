import type { IconName } from '../icons/icons';

export type SettingId = 'theme' | 'sound' | 'motion' | 'intro';

export interface SettingEntry {
  id: SettingId;
  title: string;
  description: string;
  icon: IconName;
}

/** Items in the Settings category. Choices live in settings/options.ts. */
export const settings: readonly SettingEntry[] = [
  {
    id: 'theme',
    title: 'Theme Color',
    description: 'Changes with the month. Pick a color to keep it.',
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
    description: 'Follows your system setting. Turn animation off or on here.',
    icon: 'waves',
  },
  {
    id: 'intro',
    title: 'Replay Intro',
    description: 'Play the startup animation again.',
    icon: 'rotate-ccw',
  },
];
