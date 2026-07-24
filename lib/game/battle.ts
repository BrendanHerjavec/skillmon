import { CONFIG } from "./config";
import type { BattleState, ResolveResult } from "./types";

export function createBattle(enemyHp: number, effectiveness: number): BattleState {
  return {
    hearts: CONFIG.playerHearts,
    maxHearts: CONFIG.playerHearts,
    enemyHp,
    enemyMaxHp: enemyHp,
    streak: 0,
    maxStreak: 0,
    questionIndex: 0,
    phase: "active",
    effectiveness,
  };
}

/**
 * Damage for a correct answer. Criticals fire when the streak (including this
 * answer) reaches CONFIG.critStreak. Type effectiveness scales the result,
 * rounded, never below 1.
 */
export function damageFor(streakAfterAnswer: number, effectiveness: number): {
  damage: number;
  critical: boolean;
} {
  const critical = streakAfterAnswer >= CONFIG.critStreak;
  const base = critical ? CONFIG.critDamage : CONFIG.baseDamage;
  return { damage: Math.max(1, Math.round(base * effectiveness)), critical };
}

/** Pure reducer: apply one answered (or timed-out) question to the battle. */
export function resolveAnswer(
  state: BattleState,
  answer: { correct: boolean; timedOut?: boolean },
): ResolveResult {
  if (state.phase !== "active") {
    return { state, correct: false, timedOut: false, damage: 0, critical: false, heartLost: false };
  }

  const timedOut = answer.timedOut ?? false;
  const correct = answer.correct && !timedOut;

  if (correct) {
    const streak = state.streak + 1;
    const { damage, critical } = damageFor(streak, state.effectiveness);
    const enemyHp = Math.max(0, state.enemyHp - damage);
    const next: BattleState = {
      ...state,
      enemyHp,
      streak,
      maxStreak: Math.max(state.maxStreak, streak),
      questionIndex: state.questionIndex + 1,
      phase: enemyHp === 0 ? "victory" : "active",
    };
    return { state: next, correct: true, timedOut: false, damage, critical, heartLost: false };
  }

  const hearts = Math.max(0, state.hearts - 1);
  const next: BattleState = {
    ...state,
    hearts,
    streak: 0,
    questionIndex: state.questionIndex + 1,
    phase: hearts === 0 ? "defeat" : "active",
  };
  return { state: next, correct: false, timedOut, damage: 0, critical: false, heartLost: true };
}
