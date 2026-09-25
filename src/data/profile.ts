import type { IconRef } from '../icons/icons';
import { site } from './site';

export interface ProfileLink {
  id: string;
  title: string;
  description: string;
  icon: IconRef;
  url: string;
}

export interface Profile {
  name: string;
  /** Shown under your name in the About panel. */
  headline: string;
  /** One line under your name in the Home column. */
  summary: string;
  /** Paragraphs of the About panel. */
  about: readonly string[];
  /** Also listed as items in the Home column. */
  links: readonly ProfileLink[];
}

export const profile: Profile = {
  name: site.name,
  headline: 'Software engineer',
  summary: 'I build web apps, small games and useful tools.',
  about: [
    "I'm Jake, a software engineer who likes building things people actually enjoy using: fast, thoughtful, and a little bit playful.",
    'This is where everything I make lives. Apps, games, tools and side projects, wrapped in a menu inspired by the console I grew up with. Pick something and try it out.',
  ],
  links: [
    {
      id: 'github',
      title: 'GitHub',
      description: 'github.com/CassavantJ',
      icon: '/icons/github.svg',
      url: 'https://github.com/CassavantJ',
    },
  ],
};
