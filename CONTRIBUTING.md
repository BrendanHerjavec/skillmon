# Contributing to SKILLMON

Thanks for being here. SKILLMON is week 1 of a public [52-week AI build challenge](https://github.com/BrendanHerjavec) — everything is MIT licensed, so fork it, remix it, or ship your own version.

**You do not need to understand the game engine to contribute.** The most valuable additions are *content*, and each one lives in a single file.

---

## Get it running (pick one)

**In your browser, nothing to install** — click **Code → Codespaces → Create codespace** on the repo. Dependencies install automatically and the app opens on port 3000.

**Locally:**

```bash
git clone https://github.com/BrendanHerjavec/skillmon.git
cd skillmon
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. **No API keys or database required** — Demo Mode uses a local question bank, procedural sprites, and browser storage. Everything works offline.

Optional keys unlock live AI (see [.env.example](.env.example)): `ANTHROPIC_API_KEY` for generated quizzes and creatures, `GEMINI_API_KEY` for generated creature art.

---

## Five-minute contributions

These need one file and no game-logic knowledge.

### Add a work demon

Wild enemies are the shareable joke of the game. Add one to [`content/enemies.ts`](content/enemies.ts):

```ts
{
  id: "meetingoop",
  name: "Meetingoop",
  tagline: "This could have been an email.",
  hp: 4,
  type: null,          // wild demons are typeless
  taunts: ["Let's circle back.", "Quick sync — 90 minutes."],
}
```

Keep it original (see IP rules below), keep taunts under ~12 words, and make it funny about *work*, not about people.

### Add a question pack for a skill you know

This is the highest-impact contribution — it's the whole point of the game. Question banks live in [`lib/ai/fallbackQuestions.ts`](lib/ai/fallbackQuestions.ts), split into `beginner` / `intermediate` / `advanced`:

```ts
{
  q: "What does CSS `flex: 1` shorthand expand to?",
  options: ["flex: 1 1 0%", "flex: 1 0 auto", "flex: 0 1 100%", "flex: 1 1 auto"],
  a: 0,
  why: "It sets grow:1, shrink:1, basis:0% — items share space evenly.",
}
```

Rules that matter: **exactly one correct answer**, plausible distractors, no trick questions, and `why` must actually teach something in one line (players see it when they miss). Register a new skill by adding it to the `BANKS` map at the bottom of the file.

### Add habitat decor

Props unlock by playing. Add an entry to [`content/decor.ts`](content/decor.ts) with an unlock condition, and its artwork to [`components/DecorSprite.tsx`](components/DecorSprite.tsx) as a small SVG:

```ts
{ id: "mug", name: "Cold Coffee", unlockHint: "Win 2 battles", unlocked: (s) => wins(s) >= 2 }
```

### Add an arena and gym leader

[`content/arenas.ts`](content/arenas.ts) has 8 arenas; 3–8 are visible but locked. Each has a `persona` — a system prompt giving the leader an attitude Claude plays in character. Flip `playable: true` and add questions matching its theme.

---

## Working on the engine

If you're changing mechanics, two rules keep this codebase sane:

1. **All game math is a pure function in `lib/game/`, with unit tests.** XP curve, damage, criticals, the type triangle, evolution thresholds. No game math in components. Run `npm test` — there are 37 tests and they should stay green.
2. **AI calls live behind typed interfaces in `lib/ai/`, and every one has a deterministic fallback.** The demo must never depend on a live API call succeeding. If you add an AI feature, add its offline path in the same commit.

Game constants (XP curve, timers, HP, evolution levels) all live in [`lib/game/config.ts`](lib/game/config.ts) — tune there rather than sprinkling numbers through components.

---

## Before you open a PR

```bash
npx tsc --noEmit   # types
npm test           # game math
npm run build      # production build
```

CI runs the same three on every PR. Then open the PR with a note on what you changed and why — screenshots very welcome for anything visual.

---

## Two hard rules

**No Pokémon (or other franchise) IP.** No existing creature names, no soundalikes (nothing ending in `-chu`, no `Poké-` prefix), no copied catchphrases or art. Genre grammar — types, evolutions, gyms, HP bars — is fine; specific expression is not. Everything in this repo is original and it has to stay that way.

**Never commit secrets.** `.env*` is gitignored (except `.env.example`, which holds empty placeholders only). Generated sprite art is committed as static PNGs, so no key is needed at runtime.

---

## Questions

Open an issue — including "how does X work?" ones. If something was confusing enough to ask about, that's a docs bug worth fixing.
