import { useState, type ReactNode } from 'react';

import { InputContext } from './InputContext';
import { IntentLayers } from './layers';
import { useInputSources } from './useInputSources';

/** Owns the input devices and routes their intents to the topmost `useIntentLayer`. */
export function InputProvider({ children }: { children: ReactNode }) {
  const [layers] = useState(() => new IntentLayers());
  useInputSources(layers.dispatch);
  return <InputContext value={layers}>{children}</InputContext>;
}
