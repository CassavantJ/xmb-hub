import type { IconRef } from '../icons/icons';
import type { RegistryCategoryId } from './categories';

export type OpenMode = 'same-tab' | 'new-tab' | 'embedded';
export type AppStatus = 'live' | 'beta' | 'coming-soon';

export interface AppEntry {
  /** Unique and kebab-case. Embedded apps are served at `/app/<id>`. */
  id: string;
  title: string;
  /** One line, shown under the selected item. Keep it under 90 characters. */
  description: string;
  category: RegistryCategoryId;
  /** A curated icon name (see icons.ts) or a path to a single-color SVG in `public/`. */
  icon: IconRef;
  /** Usually `subdomain('<name>')`. Can also be a root-relative path or any https URL. */
  url: string;
  /** `embedded` opens the app in an iframe inside the hub, so the app must allow framing. */
  openMode: OpenMode;
  /** `coming-soon` entries are listed but dimmed and can't be opened. */
  status: AppStatus;
  tags?: readonly string[];
  /** Source repository URL. */
  repo?: string;
}
