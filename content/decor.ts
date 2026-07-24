import type { SaveData } from "@/lib/game/types";
import { STARTERS } from "@/content/starters";

// Habitat decor — each item is earned by playing. This unlock ladder is the
// "reason to battle one more time": every win, badge, and evolution feeds
// back into the creature's home.

export interface DecorItem {
  id: string;
  name: string;
  /** Shown while locked — tells the player exactly how to earn it. */
  unlockHint: string;
  unlocked: (save: SaveData) => boolean;
}

const wins = (s: SaveData) => s.creature?.wins ?? 0;
const battles = (s: SaveData) => (s.creature?.wins ?? 0) + (s.creature?.losses ?? 0);
const stage = (s: SaveData) => s.creature?.stage ?? 0;
const hasCustom = (s: SaveData) =>
  s.discoveredLines.some((l) => !STARTERS.some((st) => st.id === l.id));

export const DECOR: DecorItem[] = [
  { id: "fern", name: "Potted Fern", unlockHint: "Always yours", unlocked: () => true },
  { id: "terminal", name: "Tiny Terminal", unlockHint: "Win 1 battle", unlocked: (s) => wins(s) >= 1 },
  { id: "lamp", name: "Glow Lamp", unlockHint: "Win 3 battles", unlocked: (s) => wins(s) >= 3 },
  { id: "arcade", name: "Mini Arcade", unlockHint: "Win 5 battles", unlocked: (s) => wins(s) >= 5 },
  { id: "bookstack", name: "Study Stack", unlockHint: "Fight 8 battles", unlocked: (s) => battles(s) >= 8 },
  { id: "plush", name: "Demon Plush", unlockHint: "Clear 2 arenas' wild demons", unlocked: (s) => s.arenaWildBeaten.length >= 2 },
  { id: "trophy", name: "Badge Trophy", unlockHint: "Earn your first badge", unlocked: (s) => s.badges.length >= 1 },
  { id: "banner", name: "Champion Banner", unlockHint: "Earn 2 badges", unlocked: (s) => s.badges.length >= 2 },
  { id: "fountain", name: "Data Fountain", unlockHint: "Earn 3 badges", unlocked: (s) => s.badges.length >= 3 },
  { id: "crystal", name: "Crystal Cluster", unlockHint: "Evolve once (stage 1)", unlocked: (s) => stage(s) >= 1 },
  { id: "mobile", name: "Star Mobile", unlockHint: "Reach the final form (stage 2)", unlocked: (s) => stage(s) >= 2 },
  { id: "poster", name: "Holo Poster", unlockHint: "Forge a custom-skill creature", unlocked: hasCustom },
];

export function isUnlocked(item: DecorItem, save: SaveData): boolean {
  return Boolean(save.flags?.allDecor) || item.unlocked(save);
}

export function decorById(id: string): DecorItem | undefined {
  return DECOR.find((d) => d.id === id);
}
