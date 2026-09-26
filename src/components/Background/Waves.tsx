import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react';

import type { Rgb } from '../../theme/color';
import styles from './Background.module.css';
import { bufferSize, hostWaves } from './waveHost';
import type { WaveRenderer } from './waveRenderer';

interface WavesProps {
  tint: Rgb;
  running: boolean;
}

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
  };
};
const isPageVisible = () => !document.hidden;

export function Waves({ tint, running }: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderer = useRef<WaveRenderer | null>(null);
  const [visible, setVisible] = useState(false);
  const pageVisible = useSyncExternalStore(subscribeVisibility, isPageVisible);
  const active = running && pageVisible;
  const initial = useEffectEvent(() => ({ tint, active }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let observer: ResizeObserver | undefined;
    // Start once the browser is idle, so the waves never compete with the first paint. WebGL
    // setup itself runs in a worker where supported, so it can't block input either.
    const start = () => {
      const settings = initial();
      const waves = hostWaves(container, settings.tint, () => {
        setVisible(true);
      });
      if (!waves) return;
      renderer.current = waves;
      waves.setRunning(settings.active);
      observer = new ResizeObserver(() => {
        const { width, height } = bufferSize(container);
        waves.resize(width, height);
      });
      observer.observe(container);
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle
      ? requestIdleCallback(start, { timeout: 1000 })
      : window.setTimeout(start, 200);
    return () => {
      if (idle) cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      observer?.disconnect();
      renderer.current?.destroy();
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    renderer.current?.setTint(tint);
  }, [tint]);

  useEffect(() => {
    renderer.current?.setRunning(active);
  }, [active]);

  return <div ref={containerRef} className={styles.waves} data-visible={visible} />;
}
