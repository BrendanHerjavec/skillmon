import { describe, it, expect } from "vitest";
import { xpToNext, victoryXp, applyXp, stageForLevel } from "../xp";

describe("xpToNext", () => {
  it("is 60 * level", () => {
    expect(xpToNext(1)).toBe(60);
    expect(xpToNext(4)).toBe(240);
  });
});

describe("victoryXp", () => {
  it("matches the spec formula", () => {
    // 50 + 15*maxStreak + 10*hearts (+10 type advantage)
    expect(victoryXp(3, 2, false).total).toBe(50 + 45 + 20);
    expect(victoryXp(0, 0, false).total).toBe(50);
    expect(victoryXp(2, 3, true).total).toBe(50 + 30 + 30 + 10);
  });
  it("exposes the breakdown for the victory screen", () => {
    const b = victoryXp(2, 1, true);
    expect(b).toEqual({
      base: 50,
      streakBonus: 30,
      heartsBonus: 10,
      typeBonus: 10,
      happyBonus: 0,
      total: 100,
    });
  });

  it("adds the happy-creature habitat bonus", () => {
    expect(victoryXp(0, 0, false, true).happyBonus).toBe(10);
    expect(victoryXp(0, 0, false, true).total).toBe(60);
    expect(victoryXp(0, 0, false, false).happyBonus).toBe(0);
  });
});

describe("stageForLevel", () => {
  it("uses the provided evolution thresholds", () => {
    expect(stageForLevel(1, [3, 6])).toBe(0);
    expect(stageForLevel(3, [3, 6])).toBe(1);
    expect(stageForLevel(5, [3, 6])).toBe(1);
    expect(stageForLevel(6, [3, 6])).toBe(2);
    expect(stageForLevel(4, [5, 12])).toBe(0);
    expect(stageForLevel(12, [5, 12])).toBe(2);
  });
});

describe("applyXp", () => {
  it("banks XP below the threshold", () => {
    const r = applyXp(1, 0, 59, [3, 6]);
    expect(r).toEqual({ level: 1, xp: 59, stage: 0, levelsGained: 0, evolved: false });
  });

  it("levels up and carries overflow", () => {
    // level 1 needs 60; 70 XP → level 2 with 10 banked
    const r = applyXp(1, 0, 70, [3, 6]);
    expect(r.level).toBe(2);
    expect(r.xp).toBe(10);
    expect(r.levelsGained).toBe(1);
  });

  it("chains multiple level-ups in one gain", () => {
    // level 1→2 costs 60, 2→3 costs 120: 200 XP → level 3, 20 banked
    const r = applyXp(1, 0, 200, [3, 6]);
    expect(r.level).toBe(3);
    expect(r.xp).toBe(20);
    expect(r.levelsGained).toBe(2);
    expect(r.evolved).toBe(true);
    expect(r.stage).toBe(1);
  });

  it("detects evolution when crossing a stage threshold", () => {
    const r = applyXp(2, 100, 25, [3, 6]); // 125 ≥ 120 → level 3 → stage 1
    expect(r.level).toBe(3);
    expect(r.evolved).toBe(true);
  });

  it("does not evolve when staying within a stage", () => {
    const r = applyXp(3, 0, 10, [3, 6]);
    expect(r.evolved).toBe(false);
    expect(r.stage).toBe(1);
  });
});
