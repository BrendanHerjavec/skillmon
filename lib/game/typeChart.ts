import { CONFIG, type SkillType } from "./config";

// The triangle: Logic beats Influence beats Craft beats Logic.
const BEATS: Record<SkillType, SkillType> = {
  logic: "influence",
  influence: "craft",
  craft: "logic",
};

export function effectiveness(attacker: SkillType, defender: SkillType | null): number {
  if (!defender) return CONFIG.effectiveness.neutral;
  if (BEATS[attacker] === defender) return CONFIG.effectiveness.advantage;
  if (BEATS[defender] === attacker) return CONFIG.effectiveness.disadvantage;
  return CONFIG.effectiveness.neutral;
}

export function hasTypeAdvantage(attacker: SkillType, defender: SkillType | null): boolean {
  return defender !== null && BEATS[attacker] === defender;
}
