import type { SkillType } from "@/lib/game/config";

// Skill domains. Week 1 ships the three live types; the rest are a visible
// roadmap of where the *type system* expands (SPEC §5: "week 1 = 3; schema
// supports more"). This is deliberately about the framework growing, not a
// fixed content menu — any skill a player types already works today via the
// custom-creature flow, mapped onto one of the live types.

export interface Domain {
  name: string;
  /** Live domains map to a real type; upcoming ones don't exist yet. */
  type: SkillType | null;
  examples: string;
}

export const DOMAINS: Domain[] = [
  { name: "Logic", type: "logic", examples: "code · data · systems" },
  { name: "Craft", type: "craft", examples: "design · making · music" },
  { name: "Influence", type: "influence", examples: "writing · sales · speaking" },
  { name: "Body", type: null, examples: "training · sport · health" },
  { name: "Tongue", type: null, examples: "languages" },
  { name: "Ledger", type: null, examples: "finance · ops" },
  { name: "Kitchen", type: null, examples: "cooking · craft food" },
  { name: "Wild", type: null, examples: "nature · navigation" },
];
