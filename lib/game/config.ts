// All game constants live here. Demo/Film Mode override values at the bottom.
// No game math in components — see /lib/game/*.

export type SkillType = "logic" | "craft" | "influence";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const FILM_MODE = process.env.NEXT_PUBLIC_FILM_MODE === "true";

export interface GameConfig {
  playerHearts: number;
  questionsPerBattle: number;
  questionTimerSec: number;
  /** Consecutive correct answers needed for a critical hit (this answer included). */
  critStreak: number;
  baseDamage: number;
  critDamage: number;
  /** [stage1 level, stage2 level] */
  evolutionLevels: [number, number];
  xpPerLevel: number;
  victoryBaseXp: number;
  victoryStreakXp: number;
  victoryHeartXp: number;
  typeAdvantageXp: number;
  /** Bonus XP when the creature enters battle happy (habitat mood). */
  happyXp: number;
  /** Mood threshold (0-100) at or above which the creature counts as happy. */
  happyMoodMin: number;
  effectiveness: { advantage: number; neutral: number; disadvantage: number };
  /** Multiplier applied to animation durations (Film Mode slows beats down). */
  motionScale: number;
  /** Creature render scale on the home dais. */
  creatureScale: number;
}

const BASE: GameConfig = {
  playerHearts: 3,
  questionsPerBattle: 8,
  questionTimerSec: 20,
  critStreak: 2,
  baseDamage: 1,
  critDamage: 2,
  evolutionLevels: [5, 12],
  xpPerLevel: 60,
  victoryBaseXp: 50,
  victoryStreakXp: 15,
  victoryHeartXp: 10,
  typeAdvantageXp: 10,
  happyXp: 10,
  happyMoodMin: 70,
  effectiveness: { advantage: 1.5, neutral: 1, disadvantage: 0.75 },
  motionScale: 1,
  creatureScale: 1,
};

export const CONFIG: GameConfig = {
  ...BASE,
  ...(DEMO_MODE ? { evolutionLevels: [3, 6] as [number, number] } : {}),
  ...(FILM_MODE ? { questionTimerSec: 30, motionScale: 1.8, creatureScale: 1.25 } : {}),
};
