import type { Question } from "./types";

/** Mulberry32 — tiny deterministic PRNG so demo battles are reproducible when seeded. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle a question's options and remap the answer index. */
export function shuffleQuestion(q: Question, random: () => number = Math.random): Question {
  const order = shuffled(q.options.map((_, i) => i), random);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    a: order.indexOf(q.a),
  };
}

/** Simple string hash for seeding procedural creatures from a skill name. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
