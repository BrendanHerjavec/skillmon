import type { SkillType } from "@/lib/game/config";
import type { CreatureLine } from "@/lib/game/types";
import { hashString } from "@/lib/game/shuffle";

// Deterministic custom-creature generator — the offline fallback for
// generateCreatureLine(). Same skill string always yields the same creature.

const LOGIC_HINTS = ["python", "code", "coding", "program", "kubernetes", "sql", "rust", "java", "typescript", "javascript", "devops", "linux", "algorithm", "data", "excel", "math", "chess", "security"];
const CRAFT_HINTS = ["design", "draw", "paint", "watercolor", "ui", "ux", "figma", "photo", "music", "guitar", "piano", "write", "writing", "cook", "pottery", "knit", "wood", "3d", "animation"];
const INFLUENCE_HINTS = ["marketing", "sales", "outreach", "negotiat", "speaking", "leader", "network", "brand", "social", "pitch", "copywriting", "seo", "manage", "teach", "spanish", "french", "language"];

export function inferType(skill: string): SkillType {
  const s = skill.toLowerCase();
  if (LOGIC_HINTS.some((h) => s.includes(h))) return "logic";
  if (CRAFT_HINTS.some((h) => s.includes(h))) return "craft";
  if (INFLUENCE_HINTS.some((h) => s.includes(h))) return "influence";
  const types: SkillType[] = ["logic", "craft", "influence"];
  return types[hashString(s) % 3];
}

const SUFFIXES: Record<SkillType, [string[], string[], string[]]> = {
  logic: [
    ["bit", "ling", "byte"],
    ["dra", "trix", "core"],
    ["thos", "tron", "nexus"],
  ],
  craft: [
    ["ling", "dab", "mote"],
    ["vex", "sel", "brush"],
    ["atryx", "lumina", "forge"],
  ],
  influence: [
    ["kit", "pip", "echo"],
    ["lark", "voz", "flare"],
    ["avox", "chora", "zenith"],
  ],
};

function stem(skill: string): string {
  const clean = skill.replace(/[^a-zA-Z]/g, "");
  if (clean.length === 0) return "Skil";
  const cut = Math.min(Math.max(4, Math.ceil(clean.length / 2)), 6);
  const s = clean.slice(0, cut).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function proceduralCreatureLine(skill: string): CreatureLine {
  const seed = hashString(skill.trim().toLowerCase());
  const type = inferType(skill);
  const base = stem(skill);
  const names = SUFFIXES[type].map(
    (opts, stage) => `${base}${opts[(seed >> (stage * 4)) % opts.length]}`,
  ) as [string, string, string];

  const flavor: Record<SkillType, string> = {
    logic: "It hums with quiet computation, growing sharper with every problem its trainer solves",
    craft: "It reshapes itself a little each time its trainer makes something with their hands",
    influence: "It glows brighter every time its trainer's words genuinely move someone",
  };

  return {
    id: `custom-${seed.toString(36)}`,
    skillName: skill.trim(),
    type,
    stageNames: names,
    lore: `${names[0]} appeared the day its trainer decided to truly learn ${skill.trim()}. ${flavor[type]}. Fully evolved, ${names[2]} is living proof of the hours no one else saw.`,
    seed,
  };
}
