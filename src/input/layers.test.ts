import { describe, expect, it, vi } from 'vitest';

import type { Intent } from './intents';
import { IntentLayers } from './layers';

const confirm: Intent = { type: 'confirm', source: 'keyboard' };

describe('IntentLayers', () => {
  it('reports unhandled when no layer is mounted', () => {
    expect(new IntentLayers().dispatch(confirm)).toBe(false);
  });

  it('sends intents to the topmost layer only', () => {
    const layers = new IntentLayers();
    const menu = vi.fn(() => true);
    const dialog = vi.fn(() => true);
    layers.push(menu);
    const closeDialog = layers.push(dialog);

    expect(layers.dispatch(confirm)).toBe(true);
    expect(dialog).toHaveBeenCalledWith(confirm);
    expect(menu).not.toHaveBeenCalled();

    closeDialog();
    layers.dispatch(confirm);
    expect(menu).toHaveBeenCalledOnce();
  });

  it('passes through whether the layer handled the intent', () => {
    const layers = new IntentLayers();
    layers.push(() => false);
    expect(layers.dispatch(confirm)).toBe(false);
  });
});
