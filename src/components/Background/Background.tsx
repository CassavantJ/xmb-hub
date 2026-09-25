import type { Rgb } from '../../theme/color';
import styles from './Background.module.css';
import { Waves } from './Waves';

interface BackgroundProps {
  waveTint: Rgb;
  /** False with reduced motion: the static gradient only. */
  animate: boolean;
  /** Stops drawing while something covers the whole screen. */
  paused: boolean;
}

/** The theme gradient, with WebGL waves over it when motion is allowed and WebGL works. */
export function Background({ waveTint, animate, paused }: BackgroundProps) {
  return (
    <div className={styles.background} aria-hidden="true">
      {animate && <Waves tint={waveTint} running={!paused} />}
    </div>
  );
}
