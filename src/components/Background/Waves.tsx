import { useEffect, useEffectEvent, useRef, useState } from 'react';

import type { Rgb } from '../../theme/color';
import styles from './Background.module.css';
import { createWaveRenderer, type WaveRenderer } from './waveRenderer';

interface WavesProps {
  tint: Rgb;
  running: boolean;
}

export function Waves({ tint, running }: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<WaveRenderer | null>(null);
  const [visible, setVisible] = useState(false);
  const initial = useEffectEvent(() => ({ tint, running }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Compile shaders once the browser is idle, so WebGL setup never delays the first paint.
    const start = () => {
      const settings = initial();
      renderer.current = createWaveRenderer(canvas, settings.tint, () => {
        setVisible(true);
      });
      renderer.current?.setRunning(settings.running);
    };
    const idle = 'requestIdleCallback' in window;
    const handle = idle
      ? requestIdleCallback(start, { timeout: 1000 })
      : window.setTimeout(start, 200);
    return () => {
      if (idle) cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      renderer.current?.destroy();
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    renderer.current?.setTint(tint);
  }, [tint]);

  useEffect(() => {
    renderer.current?.setRunning(running);
  }, [running]);

  return <canvas ref={canvasRef} className={styles.waves} data-visible={visible} />;
}
