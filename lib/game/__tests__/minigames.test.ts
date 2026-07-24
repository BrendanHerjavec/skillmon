import { describe, it, expect } from "vitest";
import { moodForScore, overlap } from "../minigames";

describe("moodForScore", () => {
  it("always pays at least 2 mood for finishing", () => {
    expect(moodForScore("bitcatch", 0)).toBe(2);
    expect(moodForScore("echo", 0)).toBe(2);
    expect(moodForScore("stack", -3)).toBe(2);
  });

  it("caps at 15 so battles stay the main engine", () => {
    expect(moodForScore("bitcatch", 40)).toBe(15);
    expect(moodForScore("echo", 8)).toBe(15);
    expect(moodForScore("stack", 20)).toBe(15);
  });

  it("scales per game", () => {
    expect(moodForScore("bitcatch", 7)).toBe(7);
    expect(moodForScore("stack", 6)).toBe(9); // ×1.5
    expect(moodForScore("echo", 4)).toBe(12); // ×3
  });
});

describe("overlap", () => {
  it("returns the intersection of two segments", () => {
    // a: [0,100] centered 50; b: [40,140] centered 90 → overlap [40,100]
    expect(overlap(50, 100, 90, 100)).toEqual({ x: 70, w: 60 });
  });

  it("returns null when segments do not touch", () => {
    expect(overlap(0, 40, 100, 40)).toBeNull();
  });

  it("handles full containment", () => {
    expect(overlap(50, 100, 50, 20)).toEqual({ x: 50, w: 20 });
  });

  it("treats edge-touching as no overlap", () => {
    expect(overlap(0, 40, 40, 40)).toBeNull();
  });
});
