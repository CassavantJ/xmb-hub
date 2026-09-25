import type { Intent, IntentHandler } from './intents';

/**
 * A stack of intent handlers. Only the topmost layer receives intents, so an open dialog
 * captures input and the menu gets it back when the dialog closes.
 */
export class IntentLayers {
  readonly #stack: IntentHandler[] = [];

  push(handler: IntentHandler): () => void {
    this.#stack.push(handler);
    return () => {
      const index = this.#stack.lastIndexOf(handler);
      if (index !== -1) this.#stack.splice(index, 1);
    };
  }

  /** Sends an intent to the topmost layer. Returns whether it was handled. */
  readonly dispatch = (intent: Intent): boolean => this.#stack.at(-1)?.(intent) ?? false;
}
