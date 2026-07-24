import { describe, it, expect } from "vitest";
import { rng, shuffled, shuffleQuestion, hashString } from "../shuffle";

describe("rng", () => {
  it("is deterministic for a given seed", () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe("shuffleQuestion", () => {
  it("keeps the answer index pointing at the correct option", () => {
    const q = { q: "?", options: ["w1", "right", "w2", "w3"], a: 1, why: "" };
    for (let seed = 0; seed < 25; seed++) {
      const s = shuffleQuestion(q, rng(seed));
      expect(s.options[s.a]).toBe("right");
      expect([...s.options].sort()).toEqual([...q.options].sort());
    }
  });
});

describe("shuffled", () => {
  it("preserves all elements", () => {
    const items = [1, 2, 3, 4, 5];
    expect([...shuffled(items, rng(7))].sort()).toEqual(items);
  });
});

describe("hashString", () => {
  it("is stable and varies across inputs", () => {
    expect(hashString("Kubernetes")).toBe(hashString("Kubernetes"));
    expect(hashString("Kubernetes")).not.toBe(hashString("watercolor"));
  });
});
