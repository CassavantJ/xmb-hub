import type { Rgb } from '../../theme/color';
import { createWaveRenderer, type WaveRenderer } from './waveRenderer';
import type { FromWorker, ToWorker } from './waves.worker';

/** The waves are soft, so they render below screen resolution and get scaled up by CSS. */
const RESOLUTION_SCALE = 0.75;

/** Drawing-buffer size for a container, in pixels. */
export function bufferSize(container: HTMLElement): { width: number; height: number } {
  const scale = Math.min(window.devicePixelRatio, 1) * RESOLUTION_SCALE;
  return {
    width: Math.max(1, Math.round(container.clientWidth * scale)),
    height: Math.max(1, Math.round(container.clientHeight * scale)),
  };
}

function addCanvas(container: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  container.append(canvas);
  return canvas;
}

const supportsWorkerCanvas = () =>
  typeof Worker === 'function' &&
  typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function';

/**
 * Starts the waves in `container`: in a worker where the browser supports OffscreenCanvas,
 * otherwise on the main thread. Calls `onVisible` after the first frame. Returns null if WebGL
 * isn't available at all, leaving the CSS gradient.
 *
 * Each call creates its own canvas, since a canvas can hand its control to a worker only once.
 */
export function hostWaves(
  container: HTMLElement,
  tint: Rgb,
  onVisible: () => void,
): WaveRenderer | null {
  if (!supportsWorkerCanvas()) return hostOnMainThread(container, tint, onVisible);

  const canvas = addCanvas(container);
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL('./waves.worker.ts', import.meta.url), { type: 'module' });
  const send = (message: ToWorker, transfer: Transferable[] = []) => {
    worker.postMessage(message, transfer);
  };

  // Remembered so a main-thread fallback can pick up where the worker left off.
  let latest = { tint, running: false, size: bufferSize(container) };
  let fallback: WaveRenderer | null = null;
  let usingFallback = false;

  worker.addEventListener('message', (event: MessageEvent<FromWorker>) => {
    if (event.data.type === 'first-frame') {
      onVisible();
      return;
    }
    // This browser has OffscreenCanvas but no WebGL in workers: draw on the main thread instead.
    worker.terminate();
    canvas.remove();
    usingFallback = true;
    fallback = hostOnMainThread(container, latest.tint, onVisible);
    fallback?.resize(latest.size.width, latest.size.height);
    fallback?.setRunning(latest.running);
  });

  send({ type: 'init', canvas: offscreen, ...latest.size, tint }, [offscreen]);

  return {
    resize(width, height) {
      latest = { ...latest, size: { width, height } };
      if (usingFallback) fallback?.resize(width, height);
      else send({ type: 'resize', width, height });
    },
    setTint(next) {
      latest = { ...latest, tint: next };
      if (usingFallback) fallback?.setTint(next);
      else send({ type: 'tint', tint: next });
    },
    setRunning(running) {
      latest = { ...latest, running };
      if (usingFallback) fallback?.setRunning(running);
      else send({ type: 'running', running });
    },
    destroy() {
      worker.terminate();
      canvas.remove();
      fallback?.destroy();
    },
  };
}

function hostOnMainThread(
  container: HTMLElement,
  tint: Rgb,
  onVisible: () => void,
): WaveRenderer | null {
  const canvas = addCanvas(container);
  const renderer = createWaveRenderer(canvas, {
    ...bufferSize(container),
    tint,
    onFirstFrame: onVisible,
  });
  if (!renderer) {
    canvas.remove();
    return null;
  }
  return {
    ...renderer,
    destroy() {
      renderer.destroy();
      canvas.remove();
    },
  };
}
