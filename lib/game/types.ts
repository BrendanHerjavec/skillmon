import type { SkillType } from "./config";

export interface Question {
  q: string;
  options: string[];
  /** Index into options of the correct answer. */
  a: number;
  /** One-line explanation shown on a wrong answer. */
  why: string;
}

export interface Enemy {
  id: string;
  name: string;
  tagline: string;
  hp: number;
  type: SkillType | null; // null = typeless work demon
  taunts: string[];
}

export type BattlePhase = "active" | "victory" | "defeat";

export interface BattleState {
  hearts: number;
  maxHearts: number;
  enemyHp: number;
  enemyMaxHp: number;
  /** Current consecutive-correct streak. */
  streak: number;
  maxStreak: number;
  questionIndex: number;
  phase: BattlePhase;
  /** Damage multiplier from the type chart (1 when no type matchup applies). */
  effectiveness: number;
}

export interface ResolveResult {
  state: BattleState;
  correct: boolean;
  timedOut: boolean;
  damage: number;
  critical: boolean;
  heartLost: boolean;
}

export interface XpResult {
  level: number;
  xp: number;
  stage: number;
  levelsGained: number;
  evolved: boolean;
}

export interface CreatureLine {
  id: string;
  skillName: string;
  type: SkillType;
  /** Stage 0 → 1 → 2 names. */
  stageNames: [string, string, string];
  lore: string;
  /** Seed for procedural sprite variation (custom creatures). */
  seed?: number;
  /** Remote sprite URLs per stage when generated art exists; procedural SVG otherwise. */
  spriteUrls?: (string | null)[];
}

export interface CreatureSave {
  line: CreatureLine;
  level: number;
  xp: number;
  stage: number;
  wins: number;
  losses: number;
}

export interface MissedQuestion {
  skillName: string;
  question: Question;
  timesMissed: number;
  lastSeen: string; // ISO date
}

export interface PlacedDecor {
  itemId: string;
  /** Index into the habitat's fixed spot list. */
  spot: number;
}

export interface HabitatState {
  placed: PlacedDecor[];
  /** 0–100. Petting/playing/decorating raises it; neglect decays it. */
  mood: number;
  lastCare: string; // ISO date of last interaction (drives decay)
  /** Best minigame scores by game id. */
  bestScores?: Record<string, number>;
}

export interface SaveFlags {
  /** Demo tools: treat every arena as playable. */
  allArenas?: boolean;
  /** Demo tools: treat every decor item as unlocked. */
  allDecor?: boolean;
}

export interface SaveData {
  version: 1;
  creature: CreatureSave | null;
  badges: number[]; // arena numbers
  /** Arenas whose wild work-demon has been cleared (gym leader unlocks next). */
  arenaWildBeaten: number[];
  missed: MissedQuestion[];
  discoveredLines: CreatureLine[];
  habitat: HabitatState;
  flags: SaveFlags;
  createdAt: string;
}
