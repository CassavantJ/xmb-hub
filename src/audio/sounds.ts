import { preferences } from '../settings/preferences';

export type SoundName = 'move' | 'confirm' | 'back' | 'denied' | 'boot';

interface Tone {
  type?: OscillatorType;
  /** Start frequency in Hz; glides to `to` if given. */
  from: number;
  to?: number;
  /** Delay from the start of the sound, in seconds. */
  at?: number;
  duration: number;
  volume: number;
  attack?: number;
}

/** Every sound is a few enveloped oscillators. Nothing is sampled, so there are no audio files. */
const SOUNDS: Record<SoundName, readonly Tone[]> = {
  // A soft, short tick.
  move: [{ from: 1500, to: 1150, duration: 0.05, volume: 0.1 }],
  // Rising fifth.
  confirm: [
    { from: 880, duration: 0.09, volume: 0.12 },
    { from: 1320, at: 0.07, duration: 0.18, volume: 0.1 },
  ],
  // Falling fifth.
  back: [
    { from: 1320, duration: 0.08, volume: 0.1 },
    { from: 880, at: 0.06, duration: 0.16, volume: 0.1 },
  ],
  // Two low bumps.
  denied: [
    { type: 'triangle', from: 220, to: 170, duration: 0.09, volume: 0.16 },
    { type: 'triangle', from: 220, to: 170, at: 0.11, duration: 0.09, volume: 0.16 },
  ],
  // A slow A-major swell for the intro.
  boot: [
    { from: 220, duration: 2.4, volume: 0.05, attack: 0.9 },
    { from: 329.63, duration: 2.4, volume: 0.045, attack: 1 },
    { from: 440, at: 0.1, duration: 2.2, volume: 0.04, attack: 1.1 },
    { from: 554.37, at: 0.3, duration: 2, volume: 0.03, attack: 1 },
    { from: 987.77, at: 0.6, duration: 1.6, volume: 0.015, attack: 0.8 },
  ],
};

/** Sounds requested while the context is still waking up are dropped if they'd play this late. */
const MAX_LATENCY_MS = 250;

let audio: { context: AudioContext; output: GainNode } | null = null;

function getAudio() {
  if (audio) return audio;
  if (typeof AudioContext === 'undefined') return null;
  const context = new AudioContext({ latencyHint: 'interactive' });
  const output = context.createGain();
  output.gain.value = 0.5;
  output.connect(context.destination);
  audio = { context, output };
  return audio;
}

/** Plays a UI sound if Sound is on in Settings. Safe to call from anywhere. */
export function playSound(name: SoundName): void {
  if (!preferences.get().sound) return;
  const current = getAudio();
  if (!current) return;
  const { context, output } = current;

  const schedule = () => {
    const start = context.currentTime + 0.005;
    for (const tone of SOUNDS[name]) playTone(context, output, start, tone);
  };

  if (context.state === 'running') {
    schedule();
    return;
  }
  // Browsers start audio suspended until a user gesture; resume and play if it wakes promptly.
  const requested = performance.now();
  context.resume().then(
    () => {
      if (performance.now() - requested < MAX_LATENCY_MS) schedule();
    },
    () => undefined,
  );
}

function playTone(context: AudioContext, output: AudioNode, start: number, tone: Tone) {
  const { type = 'sine', from, to = from, at = 0, duration, volume, attack = 0.004 } = tone;
  const begin = start + at;
  const end = begin + duration;

  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, begin);
  if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, end);

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, begin);
  envelope.gain.exponentialRampToValueAtTime(volume, begin + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(envelope).connect(output);
  oscillator.start(begin);
  oscillator.stop(end + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
}
