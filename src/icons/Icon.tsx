import { cx } from '../lib/cx';
import styles from './Icon.module.css';
import { icons, isSvgPath, type IconRef } from './icons';

interface IconProps {
  icon: IconRef;
  className?: string | undefined;
}

/** A decorative icon. It fills its box, so size it from the parent's CSS. */
export function Icon({ icon, className }: IconProps) {
  if (isSvgPath(icon)) {
    // Custom SVGs render as a mask so they take `currentColor` like the Lucide icons.
    return (
      <span
        aria-hidden="true"
        className={cx(styles.icon, styles.mask, className)}
        style={{ '--icon-src': `url("${icon}")` }}
      />
    );
  }
  const Glyph = icons[icon];
  return <Glyph aria-hidden="true" className={cx(styles.icon, className)} />;
}
