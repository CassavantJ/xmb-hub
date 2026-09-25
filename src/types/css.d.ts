import 'react';

declare module 'react' {
  // Allow CSS custom properties in `style` props, e.g. style={{ '--offset': 2 }}.
  // Augmentation only merges into an interface, so the rule's `Record` suggestion can't apply.
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [customProperty: `--${string}`]: string | number | undefined;
  }
}
