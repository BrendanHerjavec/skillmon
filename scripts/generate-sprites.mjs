// One-shot high-res creature art generation via Nano Banana (Gemini image
// API). Run `npm run sprites` with GEMINI_API_KEY set (env or .env.local).
//
// For each starter line it generates stage 0 from a rich prompt, then evolves
// stages 1-2 by passing the previous stage's image as a reference so the line
// reads as one species (SPEC §5). PNGs land in public/sprites/ and
// content/generatedSprites.ts is rewritten so the app picks them up.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "gemini-2.5-flash-image";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// ---- key resolution: env, then .env.local ----
let KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  try {
    const env = readFileSync(join(ROOT, ".env.local"), "utf8");
    const m = env.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) KEY = m[1].trim();
  } catch {}
}
if (!KEY) {
  console.error(
    "No GEMINI_API_KEY found (env or .env.local).\n" +
      "Add one and re-run: npm run sprites",
  );
  process.exit(1);
}

// NOTE: never put hex codes or any literal string in here — image models
// happily render them as text in the corner of the picture.
const STYLE =
  "Style: stylized 3D character render, like a high-end modern monster-collector video game (Palworld, Pokemon Scarlet/Violet). " +
  "Physically based rendering with soft studio key light plus colored rim light, smooth glossy subsurface-scattering skin, " +
  "subtle specular highlights, gentle ambient occlusion, volumetric glow. Appealing friendly character design with large " +
  "expressive shiny eyes and a confident cheerful expression. Full body, centered, complete creature visible, clean readable " +
  "silhouette, three-quarter view. Plain dark navy blue studio backdrop with a soft vignette. " +
  "Absolutely no text, no letters, no numbers, no colour codes, no watermark, no signature, no logo, no border, no UI.";

// Each stage must read as a DIFFERENT creature at a glance (the evolution is
// the money shot on camera), while staying obviously the same species.
// Silhouette, pose, and scale all change stage to stage.
const LINES = [
  {
    id: "logic-serpent",
    type: "emerald green serpent, glowing circuit-rune markings, cool teal rim light",
    stages: [
      "Bitling, the baby form: a tiny adorable serpent hatchling coiled in a compact spiral, looking up brightly with a happy curious expression, one small glowing cube hovering above its head. Chibi proportions, rounded body, scales with faint glowing circuit patterns.",
      "Pythra, the adolescent form: reared UP tall and alert like a cobra ready to strike, long sinuous elongated body lifted off the ground, a sharp swept-back fin crest on its head, two whisker-like antennae, brighter circuit runes tracing its whole length. Athletic and sleek — roughly three times the mass of the hatchling, standing vertical rather than curled.",
      "Serpythos, the final form: an enormous majestic hooded serpent with a wide flared cobra hood, a crown of long curved spikes, glowing runes orbiting in the air around it, radiant power aura. Imposing and regal, towering.",
    ],
  },
  {
    id: "craft-crystal",
    type: "violet living crystal, faceted amethyst body, magenta rim light",
    stages: [
      "Pixling, the baby form: a single small rounded crystal shard creature with big curious eyes, floating low, a few tiny chips orbiting it. Cute, simple, compact.",
      "Vexel, the adolescent form: a TALL angular crystal creature standing upright on two faceted crystal legs, with two sharp arm-like shards raised outward, a bright glowing core in its chest, jagged spikes along its back. Clearly bipedal and much larger — a completely different silhouette from the small floating shard.",
      "Prismatryx, the final form: a grand towering prism entity with a wide orbital ring of floating shards circling it, brilliant inner light beaming outward, an ornate crown facet. Majestic and architectural.",
    ],
  },
  {
    id: "influence-star",
    type: "amber golden star spirit, warm radiant glow, soft gold rim light",
    stages: [
      "Sparkit, the baby form: a small simple four-pointed star creature with blushing cheeks and a joyful closed-eye smile, tiny and round, floating low.",
      "Stellark, the adolescent form: a larger sharp five-pointed star being with slender glowing arms and legs extended outward in a confident heroic pose, a flowing comet tail of light trailing behind it, bold grin, radiating beams. Clearly limbed and dynamic — not a simple round star.",
      "Auravox, the final form: a magnificent six-pointed radiant celestial being surrounded by concentric glowing halo rings and small satellite stars, flowing light robes, serene powerful expression. Awe-inspiring.",
    ],
  },
];

async function generate(prompt, referenceB64) {
  const parts = [];
  if (referenceB64) parts.push({ inline_data: { mime_type: "image/png", data: referenceB64 } });
  parts.push({ text: prompt });
  const res = await fetch(`${API}?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!img) throw new Error("no image in response");
  return img;
}

mkdirSync(join(ROOT, "public", "sprites"), { recursive: true });
const manifest = {};

for (const line of LINES) {
  console.log(`\n=== ${line.id} ===`);
  let ref = null;
  const paths = [];
  for (let stage = 0; stage < 3; stage++) {
    const prompt =
      stage === 0
        ? `Design an original creature: ${line.stages[0]}. Species look: ${line.type}. ${STYLE}`
        : `The attached image is the previous evolution stage. Draw its NEXT evolution: ${line.stages[stage]}.\n` +
          `CRITICAL: this must be a dramatic, unmistakable transformation — significantly larger, with a clearly different pose, silhouette and body structure than the reference. A side-by-side viewer must instantly see it evolved; do NOT simply redraw the reference with minor tweaks.\n` +
          `Keep only the species identity consistent: same color palette, same eye style, same marking motif. Species look: ${line.type}. ${STYLE}`;
    process.stdout.write(`stage ${stage}… `);
    const b64 = await generate(prompt, ref);
    const rel = `/sprites/${line.id}-${stage}.png`;
    writeFileSync(join(ROOT, "public", rel), Buffer.from(b64, "base64"));
    console.log(`saved ${rel}`);
    paths.push(rel);
    ref = b64; // reference-chain the next stage
  }
  manifest[line.id] = paths;
}

const ts =
  "// Written by `npm run sprites` (scripts/generate-sprites.mjs) once high-res\n" +
  "// art has been generated via the Nano Banana pipeline. Maps a creature line\n" +
  "// id to its 3 stage image paths under /public. Empty = procedural SVG art.\n\n" +
  "export const GENERATED_SPRITES: Record<string, [string, string, string]> = " +
  JSON.stringify(manifest, null, 2) +
  ";\n";
writeFileSync(join(ROOT, "content", "generatedSprites.ts"), ts);
console.log("\nWrote content/generatedSprites.ts — restart the dev server to see the art.");
