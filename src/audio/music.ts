import { getAudio, whenRunning } from './engine';

/**
 * Original ambient background music, generated live: a slow D major pad progression with a soft
 * bass, and a sparse, mellow mallet melody drawn from the pentatonic scale so every note fits
 * every chord. It never repeats exactly (the melody is random) and costs a handful of
 * oscillators at a time.
 */

const CHORD_SECONDS = 9.6;
/** Chords overlap by this much, so the pad never drops out between them. */
const CROSSFADE_S = 3.5;
/** Music bus level once faded in: a quiet bed well under the UI sounds. */
export const MUSIC_LEVEL = 0.28;
const FADE_IN_S = 4;
const FADE_OUT_S = 1.6;
const LOOKAHEAD_S = 1.5;
const TICK_MS = 250;

/** MIDI notes: a bass root and a pad voicing per chord. */
const PROGRESSION = [
  { bass: 38, pad: [62, 66, 69, 73, 76] }, // Dmaj9
  { bass: 35, pad: [59, 62, 66, 69, 76] }, // Bm11
  { bass: 31, pad: [59, 62, 66, 67, 71] }, // Gmaj9
  { bass: 33, pad: [57, 61, 64, 66, 71] }, // A6/9
] as const;

/** D major pentatonic, from the middle of the pad upward, for the mallet melody. */
const BELL_NOTES = [62, 64, 66, 69, 71, 74, 76, 78] as const;

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export interface MusicTrack {
  /** Schedules everything that starts before `until` (in context time). */
  schedule(until: number): void;
  /** Stops every scheduled sound at `at`. */
  stop(at: number): void;
}

/** Creates the music on any context, live or offline (offline is handy for checking levels). */
export function createMusic(
  context: BaseAudioContext,
  destination: AudioNode,
  random: () => number = Math.random,
): MusicTrack {
  // All pad voices share one low-pass filter that slowly opens and closes.
  const padFilter = context.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 1100;
  padFilter.Q.value = 0.5;
  padFilter.connect(destination);
  const lfo = context.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 350;
  lfo.connect(lfoDepth).connect(padFilter.frequency);
  lfo.start();

  const playing = new Set<AudioScheduledSourceNode>();
  let nextChordAt = context.currentTime + 0.05;
  let chordIndex = 0;
  let nextBellAt = context.currentTime + 2.5;

  const track = (source: AudioScheduledSourceNode, ...nodes: AudioNode[]) => {
    playing.add(source);
    source.onended = () => {
      playing.delete(source);
      source.disconnect();
      for (const node of nodes) node.disconnect();
    };
  };

  const sustained = (
    frequency: number,
    start: number,
    end: number,
    level: number,
    type: OscillatorType,
    detune: number,
    output: AudioNode,
  ) => {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    const envelope = context.createGain();
    envelope.gain.value = 0; // See renderVoice in sounds.ts: never let a first frame through at 1.
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + CROSSFADE_S);
    envelope.gain.setValueAtTime(level, end - CROSSFADE_S);
    envelope.gain.linearRampToValueAtTime(0, end);
    oscillator.connect(envelope).connect(output);
    oscillator.start(start);
    oscillator.stop(end + 0.05);
    track(oscillator, envelope);
  };

  const chord = (index: number, start: number) => {
    const { bass, pad } = PROGRESSION[index % PROGRESSION.length] ?? PROGRESSION[0];
    const end = start + CHORD_SECONDS + CROSSFADE_S;
    for (const note of pad) {
      // Two slightly detuned oscillators per note give the pad its slow shimmer.
      sustained(hz(note), start, end, 0.02, 'sine', -4, padFilter);
      sustained(hz(note), start, end, 0.011, 'triangle', 5, padFilter);
    }
    sustained(hz(bass), start, end, 0.05, 'sine', 0, destination);
  };

  const bell = (start: number) => {
    const note = BELL_NOTES[Math.floor(random() * BELL_NOTES.length)] ?? BELL_NOTES[0];
    // Soft mallet: a gentle attack and a low-pass filter keep it warm rather than beepy.
    const tone = context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 1800;
    const panner = context.createStereoPanner();
    panner.pan.value = (random() - 0.5) * 1.2;
    tone.connect(panner).connect(destination);
    for (const [ratio, level] of [
      [1, 0.022],
      [2, 0.004],
      [3.01, 0.0015],
    ] as const) {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = hz(note) * ratio;
      const envelope = context.createGain();
      envelope.gain.value = 0;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(level, start + 0.04);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + 2.8 / ratio);
      oscillator.connect(envelope).connect(tone);
      oscillator.start(start);
      oscillator.stop(start + 2.9);
      track(oscillator, envelope, ...(ratio === 1 ? [tone, panner] : []));
    }
  };

  return {
    schedule(until) {
      while (nextChordAt < until) {
        chord(chordIndex, nextChordAt);
        chordIndex += 1;
        nextChordAt += CHORD_SECONDS;
      }
      while (nextBellAt < until) {
        bell(nextBellAt);
        // Sometimes answer with a second note, like a two-note phrase.
        if (random() < 0.2) bell(nextBellAt + 0.35 + random() * 0.3);
        nextBellAt += 2.4 + random() * 3.6;
      }
    },
    stop(at) {
      for (const source of playing) source.stop(at);
      lfo.stop(at);
    },
  };
}

let current: { stop: () => void } | null = null;
let cancelPendingStart: (() => void) | null = null;

/** Turns the background music on or off (fading either way). Safe to call repeatedly. */
export function setMusicEnabled(enabled: boolean): void {
  if (enabled) start();
  else stop();
}

function start() {
  if (current || cancelPendingStart) return;
  const audio = getAudio();
  if (!audio) return;
  const { context, buses } = audio;

  // Browsers block audio until the visitor interacts, so this may wait for a key or click.
  cancelPendingStart = whenRunning(context, () => {
    cancelPendingStart = null;
    const now = context.currentTime;
    const gain = buses.music.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(MUSIC_LEVEL, now + FADE_IN_S);

    const music = createMusic(context, buses.music);
    music.schedule(now + LOOKAHEAD_S);
    const timer = window.setInterval(() => {
      music.schedule(context.currentTime + LOOKAHEAD_S);
    }, TICK_MS);

    current = {
      stop: () => {
        window.clearInterval(timer);
        const at = context.currentTime;
        gain.cancelScheduledValues(at);
        gain.setValueAtTime(gain.value, at);
        gain.linearRampToValueAtTime(0, at + FADE_OUT_S);
        music.stop(at + FADE_OUT_S + 0.05);
      },
    };
  });
}

function stop() {
  cancelPendingStart?.();
  cancelPendingStart = null;
  current?.stop();
  current = null;
}
