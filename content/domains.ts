import type { SkillType } from "@/lib/game/config";

// Skill domains. Three types are live today; the rest are a visible
// roadmap of where the *type system* expands (SPEC §5: "start at 3; schema
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
