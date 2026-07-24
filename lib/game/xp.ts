import { CONFIG } from "./config";
import type { XpResult } from "./types";

export function xpToNext(level: number): number {
  return CONFIG.xpPerLevel * level;
}

export interface VictoryXpBreakdown {
  base: number;
  streakBonus: number;
  heartsBonus: number;
  typeBonus: number;
  /** Habitat bonus: the creature fought while happy (mood ≥ CONFIG.happyMoodMin). */
  happyBonus: number;
  total: number;
}

export function victoryXp(
  maxStreak: number,
  heartsRemaining: number,
  typeAdvantage: boolean,
  happy = false,
): VictoryXpBreakdown {
  const base = CONFIG.victoryBaseXp;
  const streakBonus = CONFIG.victoryStreakXp * maxStreak;
  const heartsBonus = CONFIG.victoryHeartXp * heartsRemaining;
  const typeBonus = typeAdvantage ? CONFIG.typeAdvantageXp : 0;
  const happyBonus = happy ? CONFIG.happyXp : 0;
  return {
    base,
    streakBonus,
    heartsBonus,
    typeBonus,
    happyBonus,
    total: base + streakBonus + heartsBonus + typeBonus + happyBonus,
  };
}

export function stageForLevel(level: number, evolutionLevels: [number, number] = CONFIG.evolutionLevels): number {
  if (level >= evolutionLevels[1]) return 2;
  if (level >= evolutionLevels[0]) return 1;
  return 0;
}

/** Apply an XP gain, carrying overflow across level-ups and detecting evolution. */
export function applyXp(
  level: number,
  xp: number,
  amount: number,
  evolutionLevels: [number, number] = CONFIG.evolutionLevels,
): XpResult {
  const startStage = stageForLevel(level, evolutionLevels);
  let newLevel = level;
  let newXp = xp + amount;
  while (newXp >= xpToNext(newLevel)) {
    newXp -= xpToNext(newLevel);
    newLevel += 1;
  }
  const stage = stageForLevel(newLevel, evolutionLevels);
  return {
    level: newLevel,
    xp: newXp,
    stage,
    levelsGained: newLevel - level,
    evolved: stage > startStage,
  };
}
