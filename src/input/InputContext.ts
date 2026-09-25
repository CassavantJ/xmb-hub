import { createContext } from 'react';

import type { IntentLayers } from './layers';

export const InputContext = createContext<IntentLayers | null>(null);
