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
  headline: string;
  bio: string;
  links: readonly ProfileLink[];
}

// TODO(phase 4): real bio, LinkedIn handle and contact address.
export const profile: Profile = {
  name: site.name,
  headline: 'Software engineer',
  bio: 'I build web apps and the occasional game. Everything I ship lives here.',
  links: [
    {
      id: 'github',
      title: 'GitHub',
      description: 'github.com/CassavantJ',
      icon: 'git-branch',
      url: 'https://github.com/CassavantJ',
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      description: 'Work history and experience',
      icon: 'briefcase',
      url: 'https://www.linkedin.com/',
    },
    {
      id: 'email',
      title: 'Email',
      description: 'hello@example.com',
      icon: 'mail',
      url: 'mailto:hello@example.com',
    },
  ],
};
