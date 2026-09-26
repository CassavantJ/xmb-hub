/**
 * Runs the wave renderer on an OffscreenCanvas in a worker, so WebGL setup (context creation,
 * shader compiles) and every frame stay off the main thread.
 *
 * Typed with the DOM lib the app uses; the few globals used here (postMessage,
 * addEventListener, requestAnimationFrame) behave the same in a dedicated worker.
 */
import type { Rgb } from '../../theme/color';
import { createWaveRenderer, type WaveRenderer } from './waveRenderer';

export type ToWorker =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; tint: Rgb }
  | { type: 'resize'; width: number; height: number }
  | { type: 'tint'; tint: Rgb }
  | { type: 'running'; running: boolean };

export type FromWorker = { type: 'first-frame' } | { type: 'unsupported' };

let renderer: WaveRenderer | null = null;

const send = (message: FromWorker) => {
  postMessage(message);
};

addEventListener('message', (event: MessageEvent<ToWorker>) => {
  const message = event.data;
  switch (message.type) {
    case 'init': {
      const { canvas, width, height, tint } = message;
      renderer = createWaveRenderer(canvas, {
        width,
        height,
        tint,
        onFirstFrame: () => {
          send({ type: 'first-frame' });
        },
      });
      if (!renderer) send({ type: 'unsupported' });
      break;
    }
    case 'resize':
      renderer?.resize(message.width, message.height);
      break;
    case 'tint':
      renderer?.setTint(message.tint);
      break;
    case 'running':
      renderer?.setRunning(message.running);
      break;
  }
});
