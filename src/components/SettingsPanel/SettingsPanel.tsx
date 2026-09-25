import { playSound } from '../../audio/sounds';
import { settings } from '../../data/settings';
import { Icon } from '../../icons/Icon';
import { useSystemReducedMotion } from '../../lib/motion';
import { useMonth } from '../../lib/useMonth';
import {
  applyChoice,
  choicesFor,
  selectedChoice,
  type ChoiceSetting,
} from '../../settings/options';
import { usePreferences } from '../../settings/preferences';
import { SidePanel } from '../SidePanel/SidePanel';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
  setting: ChoiceSetting;
  onClose: () => void;
}

/** A list of choices that apply immediately, so you can try colors; Back closes the panel. */
export function SettingsPanel({ setting, onClose }: SettingsPanelProps) {
  const current = usePreferences();
  const month = useMonth();
  const systemReducedMotion = useSystemReducedMotion();
  const entry = settings.find(({ id }) => id === setting);
  const selected = selectedChoice(setting, current);
  const title = entry?.title ?? '';

  return (
    <SidePanel title={title} onClose={onClose}>
      {entry && <p className={styles.description}>{entry.description}</p>}
      <div role="menu" aria-label={title} className={styles.options}>
        {choicesFor(setting, { month, systemReducedMotion }).map((choice) => {
          const checked = choice.value === selected;
          return (
            <button
              key={choice.value}
              type="button"
              role="menuitemradio"
              aria-checked={checked}
              className={styles.option}
              data-panel-item=""
              data-panel-initial={checked ? '' : undefined}
              data-swatch={choice.swatch === null ? undefined : ''}
              onClick={() => {
                applyChoice(setting, choice.value);
                playSound('confirm');
              }}
            >
              {choice.swatch !== null && (
                <span className={styles.swatch} style={{ '--swatch': choice.swatch }} />
              )}
              <span>{choice.label}</span>
              <Icon icon="check" className={styles.check} />
            </button>
          );
        })}
      </div>
    </SidePanel>
  );
}
