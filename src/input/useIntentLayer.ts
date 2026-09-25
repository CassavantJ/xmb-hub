import { useContext, useEffect, useEffectEvent } from 'react';

import { InputContext } from './InputContext';
import type { IntentHandler } from './intents';

/**
 * Receives intents while this component is the topmost mounted layer. Layers stack in mount
 * order, so a dialog rendered after the menu takes input until it unmounts.
 */
export function useIntentLayer(handler: IntentHandler): void {
  const layers = useContext(InputContext);
  const onIntent = useEffectEvent(handler);
  useEffect(() => {
    if (!layers) throw new Error('useIntentLayer needs an <InputProvider> above it');
    return layers.push((intent) => onIntent(intent));
  }, [layers]);
}
