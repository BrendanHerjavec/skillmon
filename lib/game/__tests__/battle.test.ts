import { describe, it, expect } from "vitest";
import { createBattle, resolveAnswer, damageFor } from "../battle";
import { CONFIG } from "../config";

describe("createBattle", () => {
  it("starts with full hearts and enemy HP", () => {
    const b = createBattle(4, 1);
    expect(b.hearts).toBe(CONFIG.playerHearts);
    expect(b.enemyHp).toBe(4);
    expect(b.enemyMaxHp).toBe(4);
    expect(b.streak).toBe(0);
    expect(b.phase).toBe("active");
  });
});

describe("damageFor", () => {
  it("deals base damage on a non-streak answer", () => {
    expect(damageFor(1, 1)).toEqual({ damage: CONFIG.baseDamage, critical: false });
  });
  it("deals critical damage at the streak threshold", () => {
    expect(damageFor(CONFIG.critStreak, 1)).toEqual({ damage: CONFIG.critDamage, critical: true });
  });
  it("scales with type advantage, rounding and flooring at 1", () => {
    // 1 * 1.5 = 1.5 → rounds to 2
    expect(damageFor(1, CONFIG.effectiveness.advantage).damage).toBe(2);
    // 1 * 0.75 = 0.75 → rounds to 1 (never below 1)
    expect(damageFor(1, CONFIG.effectiveness.disadvantage).damage).toBe(1);
    // crit 2 * 1.5 = 3
    expect(damageFor(CONFIG.critStreak, CONFIG.effectiveness.advantage).damage).toBe(3);
  });
});

describe("resolveAnswer", () => {
  it("correct answer damages the enemy and grows the streak", () => {
    const b = createBattle(5, 1);
    const r = resolveAnswer(b, { correct: true });
    expect(r.damage).toBe(1);
    expect(r.critical).toBe(false);
    expect(r.state.enemyHp).toBe(4);
    expect(r.state.streak).toBe(1);
    expect(r.state.maxStreak).toBe(1);
  });

  it("second consecutive correct answer is a critical for 2 damage", () => {
    let b = createBattle(5, 1);
    b = resolveAnswer(b, { correct: true }).state;
    const r = resolveAnswer(b, { correct: true });
    expect(r.critical).toBe(true);
    expect(r.damage).toBe(2);
    expect(r.state.enemyHp).toBe(2);
    expect(r.state.maxStreak).toBe(2);
  });

  it("wrong answer loses a heart and resets the streak", () => {
    let b = createBattle(5, 1);
    b = resolveAnswer(b, { correct: true }).state;
    const r = resolveAnswer(b, { correct: false });
    expect(r.heartLost).toBe(true);
    expect(r.state.hearts).toBe(2);
    expect(r.state.streak).toBe(0);
    expect(r.state.maxStreak).toBe(1);
  });

  it("timeout counts as wrong even if flagged correct", () => {
    const b = createBattle(5, 1);
    const r = resolveAnswer(b, { correct: true, timedOut: true });
    expect(r.correct).toBe(false);
    expect(r.timedOut).toBe(true);
    expect(r.state.hearts).toBe(2);
  });

  it("reaching 0 enemy HP is victory", () => {
    let b = createBattle(2, 1);
    b = resolveAnswer(b, { correct: true }).state;
    const r = resolveAnswer(b, { correct: true });
    expect(r.state.phase).toBe("victory");
    expect(r.state.enemyHp).toBe(0);
  });

  it("losing all hearts is defeat", () => {
    let b = createBattle(5, 1);
    b = resolveAnswer(b, { correct: false }).state;
    b = resolveAnswer(b, { correct: false }).state;
    const r = resolveAnswer(b, { correct: false });
    expect(r.state.phase).toBe("defeat");
    expect(r.state.hearts).toBe(0);
  });

  it("does nothing once the battle has ended", () => {
    let b = createBattle(1, 1);
    b = resolveAnswer(b, { correct: true }).state;
    const r = resolveAnswer(b, { correct: true });
    expect(r.state).toBe(b);
    expect(r.damage).toBe(0);
  });

  it("damage never overshoots below 0 enemy HP", () => {
    let b = createBattle(2, 1.5);
    b = resolveAnswer(b, { correct: true }).state; // 1*1.5→2 dmg, HP 0
    expect(b.enemyHp).toBe(0);
  });
});
