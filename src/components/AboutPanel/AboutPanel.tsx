import { profile } from '../../data/profile';
import { Icon } from '../../icons/Icon';
import { opensInNewTab } from '../../lib/links';
import { SidePanel } from '../SidePanel/SidePanel';
import styles from './AboutPanel.module.css';

export function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <SidePanel title={profile.name} onClose={onClose}>
      <p className={styles.headline}>{profile.headline}</p>
      <div className={styles.bio}>
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul role="list" className={styles.links}>
        {profile.links.map((link) => {
          const newTab = opensInNewTab(link.url);
          return (
            <li key={link.id}>
              <a
                className={styles.link}
                href={link.url}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener' : undefined}
                data-panel-item=""
              >
                <Icon icon={link.icon} className={styles.icon} />
                <span>
                  <span className={styles.linkTitle}>{link.title}</span>
                  <span className={styles.linkDescription}>
                    {link.description}
                    {newTab && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </SidePanel>
  );
}
