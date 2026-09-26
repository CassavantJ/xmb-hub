import type { Rgb } from '../../theme/color';
import fragmentSource from './waves.frag.glsl?raw';
import vertexSource from './waves.vert.glsl?raw';

/** Caps drawing at ~60fps on high-refresh displays. */
const MIN_FRAME_MS = 1000 / 60 - 1;
/** Wrapping keeps float precision in the shader; the jump happens once an hour. */
const TIME_WRAP_S = 3600;

export interface WaveRenderer {
  /** Sets the drawing-buffer size, in pixels. */
  resize(width: number, height: number): void;
  setTint(tint: Rgb): void;
  /** Runs or pauses the animation. The caller folds in page visibility. */
  setRunning(running: boolean): void;
  destroy(): void;
}

interface RendererOptions {
  width: number;
  height: number;
  tint: Rgb;
  onFirstFrame: () => void;
}

// Available on the main thread and in dedicated workers; the timer fallback covers the rest.
const requestFrame = (callback: FrameRequestCallback): number =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : setTimeout(() => {
        callback(performance.now());
      }, 16);
const cancelFrame = (id: number) => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
};

/**
 * Draws the waves with WebGL. It touches no DOM, so it runs the same on a page canvas or on an
 * OffscreenCanvas in a worker. Returns null if WebGL is unavailable (the CSS gradient stays).
 */
export function createWaveRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  { width, height, tint, onFirstFrame }: RendererOptions,
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

  const program = startProgram(gl);
  if (!program) return null;
  // Lets the driver compile off-thread; we poll for completion instead of blocking on it.
  const parallelCompile = gl.getExtension('KHR_parallel_shader_compile');

  let state: 'compiling' | 'ready' | 'failed' = 'compiling';
  let buffer: WebGLBuffer | null = null;
  let uniforms: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    tint: WebGLUniformLocation | null;
  } | null = null;

  /** Finishes setup once the program has linked. Returns whether it's ready to draw. */
  const prepare = (): boolean => {
    if (state !== 'compiling') return state === 'ready';
    // Asking for LINK_STATUS before compilation finishes would stall until it does.
    if (
      parallelCompile &&
      !gl.getProgramParameter(program, parallelCompile.COMPLETION_STATUS_KHR)
    ) {
      return false;
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) console.warn(gl.getProgramInfoLog(program));
      state = 'failed';
      gl.deleteProgram(program);
      return false;
    }
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // One triangle that covers the whole viewport.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      tint: gl.getUniformLocation(program, 'u_tint'),
    };
    state = 'ready';
    return true;
  };

  const startedAt = performance.now();
  let current: [number, number, number] = [...tint];
  let target = tint;
  let running = false;
  let frame = 0;
  let lastDraw = 0;
  let drawnOnce = false;

  const resize = (nextWidth: number, nextHeight: number) => {
    const w = Math.max(1, Math.round(nextWidth));
    const h = Math.max(1, Math.round(nextHeight));
    // Assigning a size clears the canvas, even when it's unchanged.
    if (w === canvas.width && h === canvas.height) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize(width, height);

  const draw = (now: number) => {
    if (!prepare() || !uniforms) return;
    // Ease toward a new theme tint rather than jumping to it.
    current = [
      current[0] + (target[0] - current[0]) * 0.06,
      current[1] + (target[1] - current[1]) * 0.06,
      current[2] + (target[2] - current[2]) * 0.06,
    ];
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, ((now - startedAt) / 1000) % TIME_WRAP_S);
    gl.uniform3f(uniforms.tint, current[0], current[1], current[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!drawnOnce) {
      drawnOnce = true;
      onFirstFrame();
    }
  };

  const loop = (now: number) => {
    if (state === 'failed') {
      frame = 0;
      return;
    }
    frame = requestFrame(loop);
    if (now - lastDraw < MIN_FRAME_MS) return;
    lastDraw = now;
    draw(now);
  };

  const sync = () => {
    if (running && frame === 0) frame = requestFrame(loop);
    if (!running && frame !== 0) {
      cancelFrame(frame);
      frame = 0;
    }
  };

  // If the GPU drops the context (driver reset, too many contexts), stop; the gradient remains.
  const onContextLost = (event: Event) => {
    event.preventDefault();
    running = false;
    sync();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  return {
    resize,
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
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

/** Compiles and links without waiting for the result (see `prepare`). */
function startProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;
  gl.shaderSource(vertex, vertexSource);
  gl.compileShader(vertex);
  gl.shaderSource(fragment, fragmentSource);
  gl.compileShader(fragment);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // Freed together with the program.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
}
