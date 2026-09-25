import type { Rgb } from '../../theme/color';
import fragmentSource from './waves.frag.glsl?raw';
import vertexSource from './waves.vert.glsl?raw';

/** The waves are soft, so they render below screen resolution and get scaled up by CSS. */
const RESOLUTION_SCALE = 0.75;
/** Caps drawing at ~60fps on high-refresh displays. */
const MIN_FRAME_MS = 1000 / 60 - 1;
/** Wrapping keeps float precision in the shader; the jump happens once an hour. */
const TIME_WRAP_S = 3600;

export interface WaveRenderer {
  setTint(tint: Rgb): void;
  /** Runs or pauses the animation. It also pauses by itself while the tab is hidden. */
  setRunning(running: boolean): void;
  destroy(): void;
}

/** Starts drawing waves on `canvas`. Returns null if WebGL is unavailable (the CSS gradient stays). */
export function createWaveRenderer(
  canvas: HTMLCanvasElement,
  tint: Rgb,
  onFirstFrame: () => void,
): WaveRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const program = createProgram(gl);
  if (!program) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uTint = gl.getUniformLocation(program, 'u_tint');

  const startedAt = performance.now();
  let current: [number, number, number] = [...tint];
  let target = tint;
  let running = false;
  let frame = 0;
  let lastDraw = 0;
  let drawnOnce = false;

  const draw = (now: number) => {
    const scale = Math.min(window.devicePixelRatio, 1) * RESOLUTION_SCALE;
    const width = Math.max(1, Math.round(canvas.clientWidth * scale));
    const height = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    // Ease toward a new theme tint rather than jumping to it.
    current = [
      current[0] + (target[0] - current[0]) * 0.06,
      current[1] + (target[1] - current[1]) * 0.06,
      current[2] + (target[2] - current[2]) * 0.06,
    ];

    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uTime, ((now - startedAt) / 1000) % TIME_WRAP_S);
    gl.uniform3f(uTint, current[0], current[1], current[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!drawnOnce) {
      drawnOnce = true;
      onFirstFrame();
    }
  };

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (now - lastDraw < MIN_FRAME_MS) return;
    lastDraw = now;
    draw(now);
  };

  const sync = () => {
    const shouldRun = running && document.visibilityState === 'visible';
    if (shouldRun && frame === 0) frame = requestAnimationFrame(loop);
    if (!shouldRun && frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  // If the GPU drops the context (driver reset, too many contexts), stop; the gradient remains.
  const onContextLost = (event: Event) => {
    event.preventDefault();
    running = false;
    sync();
  };

  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', onContextLost);
  draw(performance.now());

  return {
    setTint(next) {
      target = next;
    },
    setRunning(next) {
      running = next;
      sync();
    },
    destroy() {
      running = false;
      sync();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // Shaders can be freed once linked.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (import.meta.env.DEV) console.warn(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}
