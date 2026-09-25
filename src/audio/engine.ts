/**
 * One shared audio graph: a UI-sound bus and a music bus, both feeding a generated reverb and a
 * soft clipper so overlapping sounds never clip harshly. Everything is synthesized; no files.
 */
export interface Buses {
  sfx: GainNode;
  /** Starts silent; the music fades it in. */
  music: GainNode;
}

/** Builds the buses on any context, live or offline (offline is handy for checking levels). */
export function buildBuses(context: BaseAudioContext): Buses {
  // A static tanh curve rather than DynamicsCompressorNode: the compressor's automatic makeup gain
  // turned the quiet start of the intro swell into a -3 dB click. Levels are set so peaks sit
  // around -15 dB, where this curve is transparent; it only rounds off rare overlaps.
  const safety = context.createWaveShaper();
  safety.curve = softClipCurve();
  safety.connect(context.destination);

  // Each bus gets its own room: a short, tight one keeps UI sounds crisp; the music gets a long,
  // spacious one.
  const bus = (level: number, room: { seconds: number; decay: number; send: number }) => {
    const reverb = context.createConvolver();
    reverb.buffer = impulseResponse(context, room.seconds, room.decay);
    reverb.connect(safety);
    const input = context.createGain();
    input.gain.value = level;
    input.connect(safety);
    const send = context.createGain();
    send.gain.value = room.send;
    input.connect(send).connect(reverb);
    return input;
  };

  return {
    sfx: bus(1.2, { seconds: 0.5, decay: 3, send: 0.08 }),
    music: bus(0, { seconds: 2.6, decay: 2.4, send: 0.6 }),
  };
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/** One second of white noise per context, for clicks and air. */
export function noiseBuffer(context: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(context);
  if (!buffer) {
    buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(context, buffer);
  }
  return buffer;
}

/** tanh maps -1..1 with unity slope near zero (transparent at normal levels) and rounds off peaks. */
function softClipCurve(): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(2049);
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(i / 1024 - 1);
  return curve;
}

/** A synthetic room: stereo noise with an exponential tail. */
function impulseResponse(context: BaseAudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
  }
  return buffer;
}

let live: { context: AudioContext; buses: Buses } | null = null;
let suspendedWhileHidden = false;

/** The page's audio graph, created on first use. Null where Web Audio is unsupported. */
export function getAudio(): { context: AudioContext; buses: Buses } | null {
  if (live) return live;
  if (typeof AudioContext === 'undefined') return null;
  const context = new AudioContext({ latencyHint: 'interactive' });
  live = { context, buses: buildBuses(context) };
  if (document.hidden) {
    suspendedWhileHidden = true;
    void context.suspend();
  }

  // A hidden tab never makes sound: go quiet while hidden, and pick up again when it's back.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && context.state === 'running') {
      suspendedWhileHidden = true;
      void context.suspend();
    } else if (!document.hidden && suspendedWhileHidden) {
      suspendedWhileHidden = false;
      void context.resume();
    }
  });
  return live;
}

/**
 * Calls `callback` once the context is running. Browsers keep audio suspended until the visitor
 * interacts with the page, so this resumes on the next key press or pointer press if needed.
 * Returns a function that cancels the wait.
 */
export function whenRunning(context: AudioContext, callback: () => void): () => void {
  if (context.state === 'running' && !document.hidden) {
    callback();
    return () => undefined;
  }
  const resume = () => {
    if (document.hidden) return; // Wait until the tab is visible again.
    context.resume().catch(() => undefined);
  };
  const onStateChange = () => {
    if (context.state !== 'running' || document.hidden) return;
    cancel();
    callback();
  };
  const cancel = () => {
    window.removeEventListener('pointerdown', resume, { capture: true });
    window.removeEventListener('keydown', resume, { capture: true });
    context.removeEventListener('statechange', onStateChange);
  };
  window.addEventListener('pointerdown', resume, { capture: true });
  window.addEventListener('keydown', resume, { capture: true });
  context.addEventListener('statechange', onStateChange);
  resume();
  return cancel;
}
