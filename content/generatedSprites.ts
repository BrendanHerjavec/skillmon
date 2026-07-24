// Written by `npm run sprites` (scripts/generate-sprites.mjs) once high-res
// art has been generated via the Nano Banana pipeline. Maps a creature line
// id to its 3 stage image paths under /public. Empty = procedural SVG art.

export const GENERATED_SPRITES: Record<string, [string, string, string]> = {
  "logic-serpent": [
    "/sprites/logic-serpent-0.png",
    "/sprites/logic-serpent-1.png",
    "/sprites/logic-serpent-2.png"
  ],
  "craft-crystal": [
    "/sprites/craft-crystal-0.png",
    "/sprites/craft-crystal-1.png",
    "/sprites/craft-crystal-2.png"
  ],
  "influence-star": [
    "/sprites/influence-star-0.png",
    "/sprites/influence-star-1.png",
    "/sprites/influence-star-2.png"
  ]
};
