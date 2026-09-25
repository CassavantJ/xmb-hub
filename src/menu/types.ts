import type { SettingId } from '../data/settings';
import type { IconName, IconRef } from '../icons/icons';

/** What happens when an item is opened. */
export type MenuAction =
  | { kind: 'link'; href: string; newTab: boolean }
  | { kind: 'embed'; href: string; src: string }
  | { kind: 'panel'; panel: 'about' }
  | { kind: 'setting'; setting: SettingId }
  | { kind: 'none' };

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: IconRef;
  /** Short status label shown after the title, e.g. "Beta". */
  badge: string | null;
  disabled: boolean;
  action: MenuAction;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: IconName;
  items: readonly MenuItem[];
}
