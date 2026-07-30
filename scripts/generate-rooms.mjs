// Generate habitat room backdrops via Nano Banana (Gemini image API).
//
//   npm run rooms      # needs GEMINI_API_KEY in env or .env.local
//
// One painted environment per creature type. These are wide, dark, empty
// dioramas: the creature and its decor are composited on top in the DOM, so
// the art must leave the centre and floor clear and stay quiet enough not to
// compete with a glossy 3D creature standing in front of it.
//
// Same prompt discipline as scripts/generate-sprites.mjs: never put a hex code
// or any literal string in the prompt — image models render them as text.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "gemini-2.5-flash-image";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

let KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  try {
    const m = readFileSync(join(ROOT, ".env.local"), "utf8").match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) KEY = m[1].trim();
  } catch {}
}
if (!KEY) {
  console.error("No GEMINI_API_KEY found (env or .env.local). Add one and re-run: npm run rooms");
  process.exit(1);
}

const STYLE =
  "Style: stylized 3D environment render, like a cozy diorama or terrarium interior in a modern video game. " +
  "Physically based rendering, soft volumetric lighting, gentle depth of field on the background, clean readable " +
  "composition. Wide cinematic shot, eye level, looking into a small room. IMPORTANT: the centre of the frame and " +
  "the whole floor area must be EMPTY open space — no creature, no character, no people, no large object in the " +
  "middle. Scenery sits only around the edges and along the back wall. Dark, moody, low-key lighting so bright " +
  "objects placed in front will stand out. " +
  "Absolutely no text, no letters, no numbers, no watermark, no signature, no logo, no UI, no frame or border.";

const ROOMS = [
  {
    id: "logic",
    prompt:
      "A cozy dark study den for a small digital creature: back wall of glowing green circuit traces and softly " +
      "lit server racks, a few floating holographic screens with abstract shapes, cables coiling along the edges, " +
      "a smooth dark floor with faint emerald reflections. Emerald and teal glow is the only light source.",
  },
  {
    id: "craft",
    prompt:
      "A cozy dark artisan's workshop grotto for a small crystal creature: back wall of raw violet amethyst " +
      "geodes and hanging pendant lamps, a workbench with tools pushed to the far left edge, drifting motes of " +
      "purple light, a smooth dark floor with soft violet reflections. Violet and magenta glow is the only light.",
  },
  {
    id: "influence",
    prompt:
      "A cozy dark observatory lounge for a small star creature: back wall of tall arched windows showing a warm " +
      "golden night sky, a brass telescope pushed to the far right edge, hanging warm string lights, a smooth " +
      "dark floor with soft amber reflections. Warm gold and amber glow is the only light source.",
  },
];

async function generate(prompt) {
  const res = await fetch(`${API}?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { imageConfig: { aspectRatio: "16:9" } },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!img) throw new Error("no image in response");
  return img;
}

mkdirSync(join(ROOT, "public", "rooms"), { recursive: true });

for (const room of ROOMS) {
  process.stdout.write(`${room.id}… `);
  const b64 = await generate(`${room.prompt} ${STYLE}`);
  const rel = `/rooms/${room.id}.png`;
  writeFileSync(join(ROOT, "public", rel), Buffer.from(b64, "base64"));
  console.log(`saved ${rel}`);
}

console.log("\nDone. Rooms are referenced by type in app/habitat/page.tsx.");
