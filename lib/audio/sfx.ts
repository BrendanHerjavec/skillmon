"use client";

// Synthesized sound effects — no audio files, nothing to license or preload.
// Everything is generated with the Web Audio API at call time.
//
// Rules:
// - The context is created lazily on the first user gesture (browsers block
//   autoplay before one), so importing this module never touches audio.
// - Muting is persisted and read synchronously, so a muted recording session
//   stays muted across navigations.
// - Every cue is short (<1.2s) and mixed low; sound should punctuate the
//   moment, never cover the narration on a video.

const MUTE_KEY = "skillmon-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
const listeners = new Set<() => void>();

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.28; // conservative headroom for screen recording
    master.connect(ctx.destination);
  }
  // Browsers suspend the context until a gesture; resume opportunistically.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function initAudio(): void {
  if (typeof window === "undefined") return;
  muted = window.localStorage.getItem(MUTE_KEY) === "true";
  listeners.forEach((l) => l());
}

export function setMuted(next: boolean): void {
  muted = next;
  if (typeof window !== "undefined") window.localStorage.setItem(MUTE_KEY, String(next));
  listeners.forEach((l) => l());
}

export function subscribeMute(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

interface ToneOptions {
  freq: number;
  /** Target frequency for a glide; omit for a steady tone. */
  to?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  /** Seconds to wait before this tone starts. */
  delay?: number;
}

function tone({ freq, to, duration, type = "sine", gain = 0.5, delay = 0 }: ToneOptions): void {
  const c = ensureContext();
  if (!c || !master || muted) return;

  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);

  // Short attack, exponential decay — reads as "plucked" rather than "beep".
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(env).connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Filtered white noise — used for impacts and the evolution swell. */
function noise({ duration, gain = 0.3, delay = 0, sweepTo = 800 }: { duration: number; gain?: number; delay?: number; sweepTo?: number }): void {
  const c = ensureContext();
  if (!c || !master || muted) return;

  const t0 = c.currentTime + delay;
  const frames = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3200, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(60, sweepTo), t0 + duration);

  const env = c.createGain();
  env.gain.setValueAtTime(gain, t0);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(filter).connect(env).connect(master);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

/* ---------------- the cues ---------------- */

export const sfx = {
  /** Light UI tick for selections and placements. */
  tap: () => tone({ freq: 520, duration: 0.07, type: "triangle", gain: 0.22 }),

  /** Correct answer — a bright rising two-note figure. */
  correct: () => {
    tone({ freq: 660, duration: 0.1, type: "triangle", gain: 0.34 });
    tone({ freq: 990, duration: 0.16, type: "triangle", gain: 0.3, delay: 0.08 });
  },

  /** Wrong answer — a short descending buzz, not a punishing klaxon. */
  wrong: () => {
    tone({ freq: 300, to: 150, duration: 0.26, type: "sawtooth", gain: 0.2 });
  },

  /** Critical hit — impact noise plus a stacked chord. */
  critical: () => {
    noise({ duration: 0.22, gain: 0.34, sweepTo: 240 });
    tone({ freq: 320, duration: 0.2, type: "square", gain: 0.22 });
    tone({ freq: 480, duration: 0.26, type: "triangle", gain: 0.26, delay: 0.03 });
    tone({ freq: 720, duration: 0.3, type: "triangle", gain: 0.22, delay: 0.07 });
  },

  /** Ordinary hit. */
  hit: () => {
    noise({ duration: 0.13, gain: 0.22, sweepTo: 320 });
    tone({ freq: 420, to: 300, duration: 0.12, type: "square", gain: 0.16 });
  },

  /** Losing a heart. */
  hurt: () => {
    tone({ freq: 240, to: 110, duration: 0.32, type: "sawtooth", gain: 0.22 });
    noise({ duration: 0.18, gain: 0.16, sweepTo: 160 });
  },

  /** Level up — a clean ascending arpeggio. */
  levelUp: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, duration: 0.34, type: "triangle", gain: 0.3, delay: i * 0.09 }),
    );
  },

  /** Victory fanfare. */
  victory: () => {
    [523, 659, 784].forEach((f, i) =>
      tone({ freq: f, duration: 0.3, type: "triangle", gain: 0.28, delay: i * 0.1 }),
    );
    tone({ freq: 1047, duration: 0.6, type: "triangle", gain: 0.3, delay: 0.32 });
  },

  /** Evolution — the big one: rising swell into a bright chord. */
  evolve: () => {
    noise({ duration: 1.5, gain: 0.2, sweepTo: 5000 });
    tone({ freq: 180, to: 900, duration: 1.5, type: "sawtooth", gain: 0.16 });
    [659, 831, 988, 1319].forEach((f, i) =>
      tone({ freq: f, duration: 1.1, type: "triangle", gain: 0.26, delay: 1.45 + i * 0.05 }),
    );
  },

  /** Defeat — a soft descending figure. */
  defeat: () => {
    [440, 370, 294].forEach((f, i) =>
      tone({ freq: f, duration: 0.4, type: "sine", gain: 0.24, delay: i * 0.14 }),
    );
  },

  /** Petting / affection. */
  pet: () => {
    tone({ freq: 880, to: 1170, duration: 0.16, type: "sine", gain: 0.22 });
  },

  /** Minigame pickup. */
  pickup: (pitch = 0) => {
    tone({ freq: 700 + pitch * 60, duration: 0.09, type: "triangle", gain: 0.24 });
  },

  /** Minigame miss / penalty. */
  penalty: () => {
    tone({ freq: 200, to: 120, duration: 0.2, type: "square", gain: 0.18 });
  },

  /** Decor placed, stack landed. */
  place: () => {
    noise({ duration: 0.12, gain: 0.2, sweepTo: 200 });
    tone({ freq: 300, duration: 0.1, type: "sine", gain: 0.2 });
  },

  /** Unlock / new best. */
  unlock: () => {
    [784, 1047, 1319].forEach((f, i) =>
      tone({ freq: f, duration: 0.3, type: "triangle", gain: 0.26, delay: i * 0.08 }),
    );
  },
};
