// Capture README screenshots from a running SKILLMON instance.
//
//   npm run build && npm start      # production server (no dev overlay)
//   npm i -D playwright             # not a committed dependency — see below
//   node scripts/capture-screenshots.mjs
//
// Playwright is deliberately NOT in package.json: contributors shouldn't pay
// for it on every install when the captured PNGs are already committed.
// Install it ad hoc when you need to re-shoot.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "screenshots");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

mkdirSync(OUT, { recursive: true });

// A save mid-journey: evolved creature, one badge, a decorated happy habitat.
// Only `line.id` is needed — loadSave() re-hydrates built-in starters from
// content/starters.ts, so names, lore and sprite paths come along for free.
const DEMO_SAVE = {
  version: 1,
  creature: {
    line: { id: "logic-serpent", skillName: "Python", type: "logic", stageNames: ["Bitling", "Pythra", "Serpythos"], lore: "" },
    level: 3,
    xp: 55,
    stage: 1,
    wins: 2,
    losses: 0,
  },
  badges: [1],
  arenaWildBeaten: [1, 2],
  missed: [],
  discoveredLines: [{ id: "logic-serpent", skillName: "Python", type: "logic", stageNames: ["Bitling", "Pythra", "Serpythos"], lore: "" }],
  habitat: {
    placed: [
      { itemId: "fern", spot: 1 },
      { itemId: "terminal", spot: 4 },
      { itemId: "trophy", spot: 2 },
      { itemId: "crystal", spot: 5 },
    ],
    mood: 88,
    lastCare: "2026-07-24T00:00:00.000Z",
    bestScores: { bitcatch: 12, stack: 6 },
  },
  flags: {},
  createdAt: "2026-07-24T00:00:00.000Z",
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  // 1x keeps the committed PNGs a few hundred KB each; READMEs render these
  // around 900px wide, so 1280 native is already sharp. Bump to 2 if you
  // need press/retina assets.
  deviceScaleFactor: 1,
});

async function seed() {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.evaluate((save) => {
    localStorage.setItem("skillmon-save-v1", JSON.stringify(save));
    sessionStorage.removeItem("skillmon-autopilot");
  }, DEMO_SAVE);
}

// Demo-only affordances are real features, but they read as clutter in
// marketing shots — hide them at capture time rather than rebuilding.
const HIDE_DEBUG_UI = `
  .fixed.bottom-4.right-4 { display: none !important; }
`;

async function shot(name, path, prepare) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: HIDE_DEBUG_UI });
  if (prepare) await prepare();
  await page.waitForTimeout(1200); // let entry animations settle
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log("captured", `docs/screenshots/${name}.png`);
}

await seed();

await shot("title", "/");
await shot("starter", "/starter");
await shot("home", "/home");
await shot("habitat", "/habitat");
await shot("dex", "/dex");

// Battle: click through the intro so the question UI is on screen.
await shot("battle", "/battle?arena=2", async () => {
  const fight = page.getByRole("button", { name: "Fight" });
  await fight.waitFor({ timeout: 15000 });
  await fight.click();
  await page.waitForTimeout(600);
});

await browser.close();
console.log("\nDone —", OUT);
