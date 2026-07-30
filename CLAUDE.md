# CLAUDE.md

Guidance for AI coding agents (Claude Code and friends) working in this repo.
Humans: see [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

VIVARIA — a creature-collecting RPG where a creature's power comes from real
skills the player learns. Win an AI-generated quiz battle → earn XP → level up
→ evolve. Built demo-first for a public 52-week build series, so **the demo
path working offline matters more than feature count**.

## Commands

```bash
npm run dev      # dev server on :3000
npm test         # 37 unit tests over lib/game (vitest)
npx tsc --noEmit # type check
npm run build    # production build — CI runs all three
npm run sprites  # regenerate creature art (needs GEMINI_API_KEY)
```

## Architecture rules

These are load-bearing. Breaking them is how this codebase degrades.

1. **Game math is pure and tested.** Everything in `lib/game/` (XP, damage,
   criticals, type chart, evolution, minigame payouts) is a pure function with
   unit tests in `lib/game/__tests__/`. **No game math in components.** Add a
   test with any rule change.
2. **Constants live in `lib/game/config.ts`.** XP curve, timers, HP, evolution
   levels, motion scale. Demo Mode and Film Mode override values there. Never
   hardcode a game number in a component.
3. **AI goes behind typed interfaces with deterministic fallbacks.**
   `lib/ai/index.ts` exposes `generateQuiz`, `generateCreatureLine`,
   `narrateBattle`. Each tries Claude only when `ANTHROPIC_API_KEY` is set,
   validates with zod, and falls back to local content. **Any new AI feature
   ships its offline path in the same change.** The app must run fully with
   zero keys.
4. **Content is data, not code.** Starters, arenas, enemies, decor live in
   `content/`; question banks in `lib/ai/fallbackQuestions.ts`. Adding content
   should never require touching the engine.
5. **Real-time loops use wall-clock delta time.** Browsers throttle timers to
   ~1Hz in background tabs, which breaks fixed-step physics. Minigame loops
   compute `dt` from `Date.now()` (capped) and use swept collision. Don't
   reintroduce per-tick fixed steps.
6. **Save state flows through one store.** `lib/state/save.ts` holds a single
   module-level save synced to localStorage via `useSyncExternalStore`. Mutate
   with `mutateSave`/`update` — never keep a second copy in component state.
   `loadSave()` re-hydrates built-in creature lines from `content/starters.ts`
   so content updates reach existing saves.

## Conventions

- Next.js 15 App Router, TypeScript, Tailwind v4 (tokens in `app/globals.css`).
- Design system is a **warm "field guide"** look: bone paper, espresso ink,
  Fraunces + Plus Jakarta Sans, dark `.plate` medallions framing creatures.
  Use CSS variables (`--logic`, `--panel`, `--plate`) — no raw hex in
  components. There is no dark navy/pixel/CRT styling any more; don't add it.
- Creature art: generated PNGs in `public/sprites/` win when present,
  otherwise the procedural SVG renderer in `lib/sprites/CreatureSprite.tsx`.
- Redirect from `useEffect`, never during render.

## Hard constraints

- **Zero Pokémon or other franchise IP.** No existing creature names, no
  soundalikes (`-mon` or `-chu` endings, `Poké-` prefixes), no copied
  catchphrases or art. Genre grammar (types, evolutions, gyms, HP bars) is
  fine; expression must be original. The lineage this game claims is the
  browser-era **virtual-pet keeper** (habitat, mood, decor, mini-games), not
  the monster-battler — copy should lean that way.
- **Never commit secrets.** `.env*` is gitignored except `.env.example`
  (empty placeholders). Don't add keys to code, tests, or prompts —
  image models will happily render a literal string into generated art.
- **Don't break the demo path.** `/?auto=1` runs a self-playing 90-second
  tour through the real screens. If you change routing, save shape, or battle
  phases, re-run it (`lib/state/autopilot.ts` drives it per screen).

## Decisions log

[DECISIONS.md](DECISIONS.md) records every judgment call and the reasoning,
including traps already hit (image models rendering hex codes as text,
timer throttling breaking games, saves snapshotting stale content). Read it
before re-litigating a design choice, and append to it when you make one.
