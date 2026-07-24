// Pure minigame math — payout curves and geometry, unit-tested like the rest
// of /lib/game. The React game loops live in components/minigames/.

export type MinigameId = "bitcatch" | "stack" | "echo";

export interface MinigameMeta {
  id: MinigameId;
  name: string;
  tagline: string;
}

export const MINIGAMES: MinigameMeta[] = [
  { id: "bitcatch", name: "Bit Catch", tagline: "Catch clean bits, dodge the bugs" },
  { id: "stack", name: "Shard Stack", tagline: "Drop shards in rhythm, build the spire" },
  { id: "echo", name: "Echo Chamber", tagline: "Repeat the star song back" },
];

/**
 * Convert a game score into a mood payout. Every finished round cheers the
 * creature at least a little (min 2); great runs cap at +15 so battles stay
 * the main mood/XP engine.
 */
export function moodForScore(game: MinigameId, score: number): number {
  const raw =
    game === "bitcatch" ? score : game === "stack" ? Math.round(score * 1.5) : score * 3;
  return Math.max(2, Math.min(15, raw));
}

/** Horizontal overlap of two segments given by center x and width. */
export function overlap(
  aX: number,
  aW: number,
  bX: number,
  bW: number,
): { x: number; w: number } | null {
  const left = Math.max(aX - aW / 2, bX - bW / 2);
  const right = Math.min(aX + aW / 2, bX + bW / 2);
  if (right <= left) return null;
  return { x: (left + right) / 2, w: right - left };
}
