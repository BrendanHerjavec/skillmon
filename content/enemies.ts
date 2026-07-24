import type { Enemy } from "@/lib/game/types";

// Work demons — typeless wild encounters. Static taunts are the deterministic
// fallback; narrateBattle() can overwrite with a fresh Claude line per battle.
export const ENEMIES: Enemy[] = [
  {
    id: "buggon",
    name: "Buggon",
    tagline: "It multiplies when ignored.",
    hp: 3,
    type: null,
    taunts: [
      "Works on MY machine.",
      "You closed me? Cute. I reopened as three.",
      "I was in production the whole time.",
    ],
  },
  {
    id: "scopecreep",
    name: "Scopecreep",
    tagline: "Just one more feature…",
    hp: 4,
    type: null,
    taunts: [
      "While you're in there, could you also—",
      "It's basically the same ticket, right?",
      "This won't take long. Famous last words.",
    ],
  },
  {
    id: "deadlyne",
    name: "Deadlyne",
    tagline: "It was due yesterday.",
    hp: 4,
    type: null,
    taunts: [
      "Tick. Tock. Tick. Tock.",
      "The estimate was a work of fiction and you know it.",
      "I moved the milestone. Again.",
    ],
  },
  {
    id: "burnaut",
    name: "Burnaut",
    tagline: "Fueled by 3am pushes.",
    hp: 5,
    type: null,
    taunts: [
      "Sleep is just uncommitted work.",
      "One more sprint. There's always one more sprint.",
      "Your calendar belongs to me now.",
    ],
  },
];

export function enemyById(id: string): Enemy | undefined {
  return ENEMIES.find((e) => e.id === id);
}
