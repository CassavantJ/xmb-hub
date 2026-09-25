import { preferences } from '../settings/preferences';
import { getAudio, noiseBuffer } from './engine';

export type SoundName = 'move' | 'confirm' | 'back' | 'denied' | 'boot';

interface Voice {
  /** An oscillator waveform, or filtered white noise for clicks and air. */
  source: OscillatorType | 'noise';
  /** Oscillator pitch in Hz, gliding to `to`. Unused for noise. */
  from?: number;
  to?: number;
  filter?: { type: BiquadFilterType; frequency: number; q?: number };
  /** Delay from the start of the sound, in seconds. */
  at?: number;
  duration: number;
  volume: number;
  attack?: number;
}

/**
 * Original sounds in the spirit of a classic console menu: soft ticks and rounded pops in a
 * little shared reverb. They lean percussive rather than tonal: short noise clicks carry the
 * attack, and the pitched parts are brief, low and filtered so nothing reads as a "beep".
 */
const SOUNDS: Record<SoundName, readonly Voice[]> = {
  // A light tick: mostly a click of band-passed noise, with a hint of filtered body.
  move: [
    {
      source: 'noise',
      filter: { type: 'bandpass', frequency: 2200, q: 0.8 },
      duration: 0.018,
      volume: 0.28,
      attack: 0.001,
    },
    {
      source: 'triangle',
      from: 900,
      to: 700,
      duration: 0.03,
      volume: 0.05,
      attack: 0.001,
      filter: { type: 'lowpass', frequency: 1600 },
    },
  ],
  // A soft, rounded pop that lifts, over a low thump.
  confirm: [
    {
      source: 'noise',
      filter: { type: 'bandpass', frequency: 1400, q: 0.8 },
      duration: 0.02,
      volume: 0.14,
      attack: 0.001,
    },
    {
      source: 'sine',
      from: 300,
      to: 520,
      duration: 0.09,
      volume: 0.14,
      filter: { type: 'lowpass', frequency: 1200 },
    },
    { source: 'sine', from: 160, to: 110, duration: 0.08, volume: 0.1 },
  ],
  // The same shape, falling.
  back: [
    {
      source: 'noise',
      filter: { type: 'bandpass', frequency: 1200, q: 0.8 },
      duration: 0.02,
      volume: 0.12,
      attack: 0.001,
    },
    {
      source: 'sine',
      from: 480,
      to: 260,
      duration: 0.09,
      volume: 0.12,
      filter: { type: 'lowpass', frequency: 1100 },
    },
    { source: 'sine', from: 140, to: 100, duration: 0.07, volume: 0.08 },
  ],
  // A dull, low bump.
  denied: [
    {
      source: 'triangle',
      from: 190,
      to: 140,
      duration: 0.18,
      volume: 0.11,
      filter: { type: 'lowpass', frequency: 700 },
    },
    { source: 'sine', from: 95, to: 80, duration: 0.2, volume: 0.06 },
  ],
  // A slow, airy D major 9 swell under the intro.
  boot: [
    { source: 'sine', from: 146.83, duration: 3.2, volume: 0.021, attack: 1.2 },
    {
      source: 'triangle',
      from: 293.66,
      duration: 3,
      volume: 0.0105,
      attack: 1.2,
      filter: { type: 'lowpass', frequency: 1200 },
    },
    // Upper voices are filtered triangles: softer and less pure than sines.
    ...[
      { from: 369.99, at: 0.15, duration: 2.8, volume: 0.0123, attack: 1.1 },
      { from: 440, at: 0.3, duration: 2.6, volume: 0.0105, attack: 1 },
      { from: 554.37, at: 0.45, duration: 2.4, volume: 0.0087, attack: 0.9 },
      { from: 659.25, at: 0.7, duration: 2.2, volume: 0.0063, attack: 0.8 },
    ].map((voice) => ({
      ...voice,
      source: 'triangle' as const,
      filter: { type: 'lowpass' as const, frequency: 1000 },
    })),
    {
      source: 'noise',
      filter: { type: 'bandpass', frequency: 5000, q: 0.6 },
      at: 0.2,
      duration: 2.6,
      volume: 0.0052,
      attack: 1.4,
    },
  ],
};

/** Sounds requested while audio is still waking up are dropped if they'd play this late. */
const MAX_LATENCY_MS = 250;

/** Plays a UI sound if Sound is on in Settings. Safe to call from anywhere. */
export function playSound(name: SoundName): void {
  if (!preferences.get().sound) return;
  const audio = getAudio();
  if (!audio) return;
  const { context, buses } = audio;
  const play = () => {
    renderSound(context, buses.sfx, name, context.currentTime + 0.005);
  };

  if (context.state === 'running') {
    play();
    return;
  }
  const requested = performance.now();
  context.resume().then(
    () => {
      if (performance.now() - requested < MAX_LATENCY_MS) play();
    },
    () => undefined,
  );
}

/** Schedules a sound on any context and destination (live, or offline for level checks). */
export function renderSound(
  context: BaseAudioContext,
  destination: AudioNode,
  name: SoundName,
  start: number,
): void {
  for (const voice of SOUNDS[name]) renderVoice(context, destination, start, voice);
}

function renderVoice(
  context: BaseAudioContext,
  destination: AudioNode,
  start: number,
  voice: Voice,
) {
  const begin = start + (voice.at ?? 0);
  const end = begin + voice.duration;

  let source: AudioBufferSourceNode | OscillatorNode;
  if (voice.source === 'noise') {
    source = context.createBufferSource();
    source.buffer = noiseBuffer(context);
    source.loop = true;
  } else {
    source = context.createOscillator();
    source.type = voice.source;
    const from = voice.from ?? 440;
    source.frequency.setValueAtTime(from, begin);
    if (voice.to !== undefined && voice.to !== from) {
      source.frequency.exponentialRampToValueAtTime(voice.to, end);
    }
  }

  const envelope = context.createGain();
  // A GainNode defaults to 1; if the source starts a frame before the first automation event,
  // that frame would pass at full volume (an audible click on noise). Start from silence.
  envelope.gain.value = 0;
  envelope.gain.setValueAtTime(0.0001, begin);
  envelope.gain.exponentialRampToValueAtTime(voice.volume, begin + (voice.attack ?? 0.004));
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  let filter: BiquadFilterNode | null = null;
  if (voice.filter) {
    filter = context.createBiquadFilter();
    filter.type = voice.filter.type;
    filter.frequency.value = voice.filter.frequency;
    filter.Q.value = voice.filter.q ?? 1;
    source.connect(filter).connect(envelope);
  } else {
    source.connect(envelope);
  }
  envelope.connect(destination);

  if (source instanceof AudioBufferSourceNode) source.start(begin, Math.random() * 0.5);
  else source.start(begin);
  source.stop(end + 0.05);
  source.onended = () => {
    source.disconnect();
    filter?.disconnect();
    envelope.disconnect();
  };
}
