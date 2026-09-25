import { isThemeId, swatchColor, THEMES, themeForMonth } from '../theme/palette';
import { preferences, type Preferences } from './preferences';

/** Settings that open a panel of choices. (Replay Intro is an action, not a choice.) */
export type ChoiceSetting = 'theme' | 'sound' | 'music' | 'motion';

const OFF_ON: Choice[] = [
  { value: 'off', label: 'Off', swatch: null },
  { value: 'on', label: 'On', swatch: null },
];

export interface Choice {
  value: string;
  label: string;
  /** CSS color for a swatch when the choice is a color. */
  swatch: string | null;
}

interface ChoiceContext {
  month: number;
  systemReducedMotion: boolean;
}

const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' });

export function choicesFor(setting: ChoiceSetting, context: ChoiceContext): Choice[] {
  switch (setting) {
    case 'theme': {
      const monthly = themeForMonth(context.month);
      const month = monthName.format(new Date(2000, context.month, 1));
      return [
        {
          value: 'monthly',
          label: `Monthly (${month}: ${monthly.name})`,
          swatch: swatchColor(monthly),
        },
        ...THEMES.map((theme) => ({
          value: theme.id,
          label: theme.name,
          swatch: swatchColor(theme),
        })),
      ];
    }
    case 'sound':
    case 'music':
      return OFF_ON;
    case 'motion':
      return [
        {
          value: 'system',
          label: `System setting (currently ${context.systemReducedMotion ? 'reduced' : 'full'})`,
          swatch: null,
        },
        { value: 'reduced', label: 'Reduced', swatch: null },
        { value: 'full', label: 'Full', swatch: null },
      ];
  }
}

export function selectedChoice(setting: ChoiceSetting, current: Preferences): string {
  switch (setting) {
    case 'theme':
      return current.theme;
    case 'sound':
      return current.sound ? 'on' : 'off';
    case 'music':
      return current.music ? 'on' : 'off';
    case 'motion':
      return current.motion;
  }
}

export function applyChoice(setting: ChoiceSetting, value: string): void {
  switch (setting) {
    case 'theme':
      if (value === 'monthly' || isThemeId(value)) preferences.set({ theme: value });
      break;
    case 'sound':
      preferences.set({ sound: value === 'on' });
      break;
    case 'music':
      preferences.set({ music: value === 'on' });
      break;
    case 'motion':
      if (value === 'system' || value === 'reduced' || value === 'full') {
        preferences.set({ motion: value });
      }
      break;
  }
}
