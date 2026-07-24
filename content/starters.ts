import type { CreatureLine } from "@/lib/game/types";
import { GENERATED_SPRITES } from "./generatedSprites";

export const STARTERS: CreatureLine[] = [
  {
    id: "logic-serpent",
    spriteUrls: GENERATED_SPRITES["logic-serpent"],
    skillName: "Python",
    type: "logic",
    stageNames: ["Bitling", "Pythra", "Serpythos"],
    lore: "Hatched from a single bit that refused to stay zero. Bitling grows by swallowing solved problems whole; by its final form, Serpythos is said to dream in bytecode.",
  },
  {
    id: "craft-crystal",
    spriteUrls: GENERATED_SPRITES["craft-crystal"],
    skillName: "UI Design",
    type: "craft",
    stageNames: ["Pixling", "Vexel", "Prismatryx"],
    lore: "A shard of screen-light that learned to arrange itself beautifully. Every interface Pixling studies adds a facet; Prismatryx refracts raw ideas into pure hierarchy.",
  },
  {
    id: "influence-star",
    spriteUrls: GENERATED_SPRITES["influence-star"],
    skillName: "Marketing",
    type: "influence",
    stageNames: ["Sparkit", "Stellark", "Auravox"],
    lore: "Born where a great idea met its first audience. Sparkit feeds on attention honestly earned; fully evolved, Auravox can make a whole room lean in at once.",
  },
];

export function starterById(id: string): CreatureLine | undefined {
  return STARTERS.find((s) => s.id === id);
}
