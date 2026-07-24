import { describe, it, expect } from "vitest";
import { effectiveness, hasTypeAdvantage } from "../typeChart";
import { CONFIG } from "../config";

describe("type chart triangle", () => {
  it("logic beats influence beats craft beats logic", () => {
    expect(effectiveness("logic", "influence")).toBe(CONFIG.effectiveness.advantage);
    expect(effectiveness("influence", "craft")).toBe(CONFIG.effectiveness.advantage);
    expect(effectiveness("craft", "logic")).toBe(CONFIG.effectiveness.advantage);
  });

  it("reverse matchups are at a disadvantage", () => {
    expect(effectiveness("influence", "logic")).toBe(CONFIG.effectiveness.disadvantage);
    expect(effectiveness("craft", "influence")).toBe(CONFIG.effectiveness.disadvantage);
    expect(effectiveness("logic", "craft")).toBe(CONFIG.effectiveness.disadvantage);
  });

  it("mirror and typeless matchups are neutral", () => {
    expect(effectiveness("logic", "logic")).toBe(CONFIG.effectiveness.neutral);
    expect(effectiveness("logic", null)).toBe(CONFIG.effectiveness.neutral);
  });

  it("hasTypeAdvantage only fires on the winning edge", () => {
    expect(hasTypeAdvantage("logic", "influence")).toBe(true);
    expect(hasTypeAdvantage("influence", "logic")).toBe(false);
    expect(hasTypeAdvantage("logic", null)).toBe(false);
  });
});
