"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { arenaByNumber } from "@/content/arenas";
import { enemyById } from "@/content/enemies";
import { CONFIG } from "@/lib/game/config";
import { createBattle, resolveAnswer } from "@/lib/game/battle";
import { effectiveness, hasTypeAdvantage } from "@/lib/game/typeChart";
import { applyXp, victoryXp, xpToNext, type VictoryXpBreakdown } from "@/lib/game/xp";
import { hashString, shuffleQuestion, shuffled } from "@/lib/game/shuffle";
import { fallbackQuestions } from "@/lib/ai/fallbackQuestions";
import type { BattleState, Question, XpResult } from "@/lib/game/types";
import { recordMiss, useSave } from "@/lib/state/save";
import { beat, setAuto, useAutopilot } from "@/lib/state/autopilot";
import { sfx } from "@/lib/audio/sfx";
import { ArcadeButton, Bar, HeartRow, TypeBadge } from "@/components/ui";
import { CreatureSprite, DemonSprite, typePalette } from "@/lib/sprites/CreatureSprite";

type Phase = "loading" | "intro" | "question" | "feedback" | "victory" | "defeat";

interface Feedback {
  question: Question;
  chosen: number | null; // null = timeout
  correct: boolean;
  damage: number;
  critical: boolean;
}

interface VictoryData {
  breakdown: VictoryXpBreakdown;
  xpResult: XpResult;
  prevStage: number;
  prevLevel: number;
}

interface Foe {
  kind: "wild" | "leader";
  name: string;
  subtitle: string;
  hp: number;
  type: import("@/lib/game/config").SkillType | null;
  introLine: string;
  persona?: string;
  seed: number;
}

function BattleScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const arenaNum = Number(params.get("arena") ?? "1");
  const arena = arenaByNumber(arenaNum) ?? arenaByNumber(1)!;

  const { save, update, loaded } = useSave();
  const auto = useAutopilot();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [victory, setVictory] = useState<VictoryData | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionRevealed, setEvolutionRevealed] = useState(false);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(CONFIG.questionTimerSec);
  const [popKey, setPopKey] = useState(0);
  const settled = useRef(false);

  const creature = save?.creature ?? null;

  // Foe is frozen at battle start — the save changes on victory, and the foe
  // shown in the victory overlay must not change with it.
  const [foe, setFoe] = useState<Foe | null>(null);

  /* ---------------- setup ---------------- */

  useEffect(() => {
    if (!loaded) return;
    if (!creature) {
      router.replace("/starter");
      return;
    }
    if (battle) return;

    // Wild demon gates the arena; once beaten, the gym leader awaits (badge).
    const wildBeaten = save?.arenaWildBeaten.includes(arena.number) ?? false;
    const wild = enemyById(arena.wildEnemy)!;
    const foeNow: Foe = wildBeaten
      ? {
          kind: "leader",
          name: arena.leader,
          subtitle: `${arena.name} · ${arena.leaderTitle}`,
          hp: arena.hp,
          type: arena.leaderType,
          introLine: arena.introLine,
          persona: arena.persona,
          seed: hashString(arena.leader),
        }
      : {
          kind: "wild",
          name: wild.name,
          subtitle: wild.tagline,
          hp: wild.hp,
          type: wild.type,
          introLine: wild.taunts[Math.floor(Math.random() * wild.taunts.length)],
          persona: undefined,
          seed: hashString(wild.id),
        };
    setFoe(foeNow);

    const eff = effectiveness(creature.line.type, foeNow.type);
    setBattle(createBattle(foeNow.hp, eff));

    // Fetch quiz with a hard client timeout; the local bank is always ready.
    // The auto-demo won't wait — a live Claude round-trip is ~5-7s of dead
    // air per battle, which is most of a highlight reel's budget. It still
    // fires the request (so a fast response is used) but bails to the local
    // bank almost immediately.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), auto.active ? 1200 : 6000);
    const localBank = () =>
      fallbackQuestions(creature.line.skillName, creature.level, CONFIG.questionsPerBattle).map((q) =>
        shuffleQuestion(q),
      );

    (async () => {
      let qs: Question[];
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            skill: creature.line.skillName,
            level: creature.level,
            count: CONFIG.questionsPerBattle,
          }),
        });
        qs = res.ok ? ((await res.json()) as { questions: Question[] }).questions : localBank();
      } catch {
        qs = localBank();
      } finally {
        clearTimeout(timer);
      }

      // Spaced-repetition seed: up to 2 previously-missed questions return.
      const missed = (save?.missed ?? [])
        .filter((m) => m.skillName === creature.line.skillName)
        .slice(0, 2)
        .map((m) => shuffleQuestion(m.question));
      const pool = [...missed, ...qs.filter((q) => !missed.some((m) => m.q === q.q))];
      setQuestions(shuffled(pool).slice(0, CONFIG.questionsPerBattle));
      setPhase("intro");
    })();

    // Fresh Claude taunt, fire-and-forget; canned line stays if it never lands.
    fetch("/api/taunt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enemyName: foeNow.name, tagline: foeNow.subtitle, persona: foeNow.persona }),
    })
      .then((r) => r.json())
      .then((d: { taunt: string | null }) => d.taunt && setTaunt(d.taunt))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, creature, battle]);

  /* ---------------- timer ---------------- */

  useEffect(() => {
    if (phase !== "question") return;
    setTimeLeft(CONFIG.questionTimerSec);
    const started = Date.now();
    const iv = setInterval(() => {
      const left = CONFIG.questionTimerSec - (Date.now() - started) / 1000;
      if (left <= 0) {
        clearInterval(iv);
        answerQuestion(null); // timeout
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, battle?.questionIndex]);

  /* ---------------- battle actions ---------------- */

  const currentQuestion: Question | null =
    battle && questions.length > 0 ? questions[battle.questionIndex % questions.length] : null;

  const answerQuestion = useCallback(
    (choice: number | null) => {
      if (!battle || !currentQuestion || phase !== "question" || !creature) return;
      const correct = choice !== null && choice === currentQuestion.a;
      const result = resolveAnswer(battle, { correct, timedOut: choice === null });

      // Audio punctuation: crit > hit > wrong.
      if (result.correct) {
        if (result.critical) sfx.critical();
        else sfx.hit();
      } else {
        sfx.wrong();
        sfx.hurt();
      }

      setBattle(result.state);
      setFeedback({
        question: currentQuestion,
        chosen: choice,
        correct: result.correct,
        damage: result.damage,
        critical: result.critical,
      });
      setPopKey((k) => k + 1);
      if (!result.correct) {
        update((s) => recordMiss(s, creature.line.skillName, currentQuestion));
      }
      setPhase("feedback");
    },
    [battle, currentQuestion, phase, creature, update],
  );

  const continueBattle = useCallback(() => {
    if (!battle || !creature || !foe) return;
    if (battle.phase === "victory") {
      if (settled.current) return;
      settled.current = true;

      const advantage = hasTypeAdvantage(creature.line.type, foe.type);
      const happy = (save?.habitat.mood ?? 0) >= CONFIG.happyMoodMin;
      const breakdown = victoryXp(battle.maxStreak, battle.hearts, advantage, happy);
      const xpResult = applyXp(creature.level, creature.xp, breakdown.total);
      setVictory({ breakdown, xpResult, prevStage: creature.stage, prevLevel: creature.level });

      sfx.victory();
      if (xpResult.levelsGained > 0) setTimeout(() => sfx.levelUp(), 900);

      update((s) => ({
        ...s,
        creature: s.creature
          ? {
              ...s.creature,
              level: xpResult.level,
              xp: xpResult.xp,
              stage: xpResult.stage,
              wins: s.creature.wins + 1,
            }
          : s.creature,
        badges:
          foe.kind === "leader" && !s.badges.includes(arena.number)
            ? [...s.badges, arena.number]
            : s.badges,
        arenaWildBeaten:
          foe.kind === "wild" && !s.arenaWildBeaten.includes(arena.number)
            ? [...s.arenaWildBeaten, arena.number]
            : s.arenaWildBeaten,
        // Winning cheers the creature up a little.
        habitat: { ...s.habitat, mood: Math.min(100, s.habitat.mood + 5) },
      }));
      setPhase("victory");
    } else if (battle.phase === "defeat") {
      if (!settled.current) {
        settled.current = true;
        update((s) => ({
          ...s,
          creature: s.creature ? { ...s.creature, losses: s.creature.losses + 1 } : s.creature,
        }));
      }
      sfx.defeat();
      setPhase("defeat");
    } else {
      setFeedback(null);
      setPhase("question");
    }
  }, [battle, creature, foe, arena.number, save, update]);

  // Auto-advance quickly after a correct answer; wrong answers wait for the
  // player to read the explanation. The tour moves faster still.
  useEffect(() => {
    if (phase !== "feedback" || !feedback?.correct) return;
    const hold = (auto.active ? 750 : 1300) * CONFIG.motionScale;
    const t = setTimeout(continueBattle, hold);
    return () => clearTimeout(t);
  }, [phase, feedback, continueBattle, auto.active]);

  // Evolution surge sequencing inside the victory overlay.
  const beginEvolution = useCallback(() => {
    sfx.evolve();
    setShowEvolution(true);
    setTimeout(() => setEvolutionRevealed(true), 1600 * CONFIG.motionScale);
  }, []);

  /* ---------------- auto-demo ---------------- */

  // Plays the battle hands-free: always answers correctly, so the streak
  // builds into a critical and the win is guaranteed on camera.
  useEffect(() => {
    if (!auto.active) return;
    let t: ReturnType<typeof setTimeout> | undefined;

    if (phase === "loading" && creature) {
      setAuto({ caption: `Real ${creature.line.skillName} questions, generated for this fight…` });
    } else if (phase === "intro" && foe) {
      setAuto({ caption: `${foe.name} — "${taunt ?? foe.introLine}"` });
      t = setTimeout(() => setPhase("question"), beat(2000));
    } else if (phase === "question" && currentQuestion) {
      setAuto({
        caption:
          battle && battle.streak >= CONFIG.critStreak - 1 && battle.streak > 0
            ? "Answer right again for a CRITICAL hit."
            : "Answer a real question on the skill to attack.",
      });
      t = setTimeout(() => answerQuestion(currentQuestion.a), beat(1700));
    } else if (phase === "feedback" && feedback?.critical) {
      setAuto({ caption: "Two in a row — CRITICAL HIT, double damage." });
    } else if (phase === "victory" && victory) {
      if (victory.xpResult.evolved && !showEvolution) {
        setAuto({ caption: `+${victory.breakdown.total} XP · Lv ${victory.xpResult.level} — something is happening…` });
        t = setTimeout(beginEvolution, beat(2600));
      } else if (!victory.xpResult.evolved) {
        setAuto({ caption: `+${victory.breakdown.total} XP — every win is a visible change.` });
        t = setTimeout(() => {
          setAuto({ battlesDone: auto.battlesDone + 1 });
          router.push("/home");
        }, beat(2600));
      }
    }

    return () => {
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto.active, phase, currentQuestion, victory, showEvolution, feedback, foe, taunt, creature]);

  // Let the evolution reveal breathe, then head home to show the new form.
  useEffect(() => {
    if (!auto.active || !evolutionRevealed || !creature) return;
    setAuto({ caption: `${creature.line.stageNames[0]} evolved into ${creature.line.stageNames[creature.stage]}.` });
    // The one beat that keeps its length — this is the money shot.
    const t = setTimeout(() => {
      setAuto({ battlesDone: auto.battlesDone + 1 });
      router.push("/home");
    }, beat(4200));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto.active, evolutionRevealed]);

  /* ---------------- render ---------------- */

  if (!loaded || !creature || !battle || !foe) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <p className="font-display animate-pulse text-dim">entering arena…</p>
      </main>
    );
  }

  const p = typePalette(creature.line.type);
  const timerPct = (timeLeft / CONFIG.questionTimerSec) * 100;

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col px-5 py-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="eyebrow">{arena.name}</span>
        <span className="eyebrow">
          {foe.kind === "leader" ? "gym battle" : "wild encounter"}
        </span>
      </div>

      {/* Combatants share the vertical band between header and dialog so the
          arena reads as a face-off instead of leaving a void mid-screen. */}
      <div className="flex flex-1 flex-col justify-center gap-8 py-6">
      {/* ---- enemy (top-right) ---- */}
      <section className="flex items-center justify-end gap-5">
        <div className="panel max-w-xs p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {foe.type && <TypeBadge type={foe.type} />}
            <span className="font-display text-lg">{foe.name}</span>
          </div>
          <p className="mt-1 text-xs text-dim">{foe.subtitle}</p>
          <div className="mt-3">
            <Bar value={battle.enemyHp} max={battle.enemyMaxHp} color="var(--hp)" label={`${foe.name} HP`} />
            <p className="mt-1 text-xs text-dim">
              {battle.enemyHp} / {battle.enemyMaxHp} HP
            </p>
          </div>
        </div>
        <div
          className={`plate relative grid h-40 w-40 shrink-0 place-items-center ${feedback && feedback.damage > 0 ? "anim-shake" : ""}`}
          key={`enemy-${popKey}`}
        >
          {foe.kind === "leader" ? (
            <CreatureSprite line={{ type: foe.type!, seed: foe.seed }} stage={2} size={148} />
          ) : (
            <DemonSprite seed={foe.seed} size={148} />
          )}
          {feedback && feedback.damage > 0 && (
            <span
              key={popKey}
              className="anim-damage-pop font-display absolute left-1/2 top-2 -translate-x-1/2 text-2xl"
              style={{ color: feedback.critical ? "var(--influence)" : "var(--hp)" }}
            >
              {feedback.critical ? `CRIT −${feedback.damage}` : `−${feedback.damage}`}
            </span>
          )}
        </div>
      </section>

      {/* ---- player (bottom-left) ---- */}
      <section className="flex items-center justify-start gap-5">
        <div
          className={`plate grid h-40 w-40 shrink-0 place-items-center ${feedback && !feedback.correct && phase === "feedback" ? "anim-shake" : ""}`}
        >
          <CreatureSprite line={creature.line} stage={creature.stage} size={148} />
        </div>
        <div className="panel p-4">
          <div className="flex items-center gap-3">
            <span className="font-display" style={{ color: p.main }}>
              {creature.line.stageNames[creature.stage]}
            </span>
            <span className="text-xs text-dim">Lv {creature.level}</span>
          </div>
          <div className="mt-2">
            <HeartRow hearts={battle.hearts} max={battle.maxHearts} />
          </div>
          {battle.streak >= 1 && (
            <p className="font-display mt-2 text-xs" style={{ color: "var(--influence)" }}>
              {battle.streak >= CONFIG.critStreak ? "⚡ CRITICAL READY" : `streak ×${battle.streak}`}
            </p>
          )}
        </div>
      </section>
      </div>

      {/* ---- dialog box ---- */}
      <section className="panel flex min-h-64 flex-col p-5">
        {phase === "loading" && <p className="animate-pulse text-dim">Preparing questions…</p>}

        {phase === "intro" && (
          <div className="anim-rise flex flex-1 flex-col">
            <p className="text-lg leading-relaxed">
              <span className="font-display" style={{ color: "var(--hp)" }}>
                {foe.name}:
              </span>{" "}
              “{taunt ?? foe.introLine}”
            </p>
            <p className="mt-2 text-sm text-dim">
              {CONFIG.questionsPerBattle} questions on {creature.line.skillName}. Answer fast —{" "}
              {CONFIG.questionTimerSec}s each. Streaks hit critical.
            </p>
            <div className="mt-auto flex justify-end">
              <ArcadeButton onClick={() => setPhase("question")} color="var(--hp)" autoFocus>
                Fight
              </ArcadeButton>
            </div>
          </div>
        )}

        {phase === "question" && currentQuestion && (
          <div className="flex flex-1 flex-col">
            {/* timer */}
            <div
              className="h-2 overflow-hidden rounded-sm bg-bg"
              role="timer"
              aria-label={`${Math.ceil(timeLeft)} seconds left`}
            >
              <div
                className="h-full"
                style={{
                  width: `${timerPct}%`,
                  background: timerPct < 25 ? "var(--hp)" : "var(--xp)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
            <p className="mt-4 text-lg font-semibold leading-snug">{currentQuestion.q}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerQuestion(i)}
                  className="panel cursor-pointer px-4 py-3 text-left text-sm transition-colors hover:border-xp"
                >
                  <span className="font-display mr-2 text-xs text-dim">{"ABCD"[i]}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "feedback" && feedback && (
          <div className="anim-rise flex flex-1 flex-col">
            {feedback.correct ? (
              <p className="font-display text-xl" style={{ color: "var(--logic)" }}>
                {feedback.critical ? "CRITICAL HIT!" : "Correct!"}
              </p>
            ) : (
              <>
                <p className="font-display text-xl" style={{ color: "var(--hp)" }}>
                  {feedback.chosen === null ? "Time's up!" : "Wrong!"}
                </p>
                <p className="mt-3 text-sm">
                  <span className="text-dim">Answer:</span>{" "}
                  <span className="font-semibold" style={{ color: "var(--logic)" }}>
                    {feedback.question.options[feedback.question.a]}
                  </span>
                </p>
                <p className="mt-2 text-sm text-dim">{feedback.question.why}</p>
              </>
            )}
            {!feedback.correct && (
              <div className="mt-auto flex justify-end">
                <ArcadeButton onClick={continueBattle} autoFocus>
                  {battle.phase === "active" ? "Continue" : battle.phase === "victory" ? "Finish" : "…"}
                </ArcadeButton>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---- victory overlay ---- */}
      {phase === "victory" && victory && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-6 backdrop-blur-sm">
          {!showEvolution ? (
            <div className="panel anim-rise w-full max-w-md p-8 text-center">
              <p className="eyebrow">victory</p>
              <h2 className="font-display mt-2 text-3xl" style={{ color: "var(--influence)" }}>
                {foe.name} defeated!
              </h2>
              {foe.kind === "leader" && (
                <p className="mt-2 text-sm" style={{ color: "var(--influence)" }}>
                  ★ {arena.name} badge earned
                </p>
              )}
              <dl className="mx-auto mt-6 max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-dim">Victory</dt><dd>+{victory.breakdown.base} XP</dd></div>
                <div className="flex justify-between"><dt className="text-dim">Best streak ×{battle.maxStreak}</dt><dd>+{victory.breakdown.streakBonus} XP</dd></div>
                <div className="flex justify-between"><dt className="text-dim">Hearts left ×{battle.hearts}</dt><dd>+{victory.breakdown.heartsBonus} XP</dd></div>
                {victory.breakdown.typeBonus > 0 && (
                  <div className="flex justify-between"><dt className="text-dim">Type advantage</dt><dd>+{victory.breakdown.typeBonus} XP</dd></div>
                )}
                {victory.breakdown.happyBonus > 0 && (
                  <div className="flex justify-between"><dt className="text-dim">Happy creature</dt><dd>+{victory.breakdown.happyBonus} XP</dd></div>
                )}
                <div className="flex justify-between border-t border-panel-border pt-1.5 font-semibold">
                  <dt>Total</dt>
                  <dd style={{ color: "var(--xp)" }}>+{victory.breakdown.total} XP</dd>
                </div>
              </dl>

              <div className="mt-6">
                <Bar value={victory.xpResult.xp} max={xpToNext(victory.xpResult.level)} color="var(--xp)" label="XP" />
                <p className="mt-2 text-sm text-dim">
                  {victory.xpResult.levelsGained > 0 ? (
                    <span className="font-display text-base" style={{ color: "var(--logic)" }}>
                      LEVEL UP! Lv {victory.prevLevel} → {victory.xpResult.level}
                    </span>
                  ) : (
                    <>Lv {victory.xpResult.level} · {victory.xpResult.xp}/{xpToNext(victory.xpResult.level)} XP</>
                  )}
                </p>
              </div>

              <div className="mt-8">
                {victory.xpResult.evolved ? (
                  <ArcadeButton onClick={beginEvolution} color={p.main} autoFocus>
                    ✦ Something is happening…
                  </ArcadeButton>
                ) : (
                  <ArcadeButton onClick={() => router.push("/home")} autoFocus>
                    Return home
                  </ArcadeButton>
                )}
              </div>
            </div>
          ) : (
            /* ---- evolution surge: THE shot (SPEC §4) ---- */
            <div className="fixed inset-0 grid place-items-center overflow-hidden">
              <div
                className="absolute inset-0 bg-white"
                style={{ animation: `surge-flash ${2.2 * CONFIG.motionScale}s ease-in-out forwards` }}
              />
              {/* rotating god-rays behind the reveal */}
              {evolutionRevealed && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    width: "150vmax",
                    height: "150vmax",
                    background: `conic-gradient(from 0deg, transparent 0deg, ${p.main}30 8deg, transparent 16deg, transparent 30deg, ${p.main}24 38deg, transparent 46deg, transparent 60deg, ${p.main}30 68deg, transparent 76deg, transparent 90deg, ${p.main}24 98deg, transparent 106deg, transparent 120deg, ${p.main}30 128deg, transparent 136deg, transparent 150deg, ${p.main}24 158deg, transparent 166deg, transparent 180deg, ${p.main}30 188deg, transparent 196deg, transparent 210deg, ${p.main}24 218deg, transparent 226deg, transparent 240deg, ${p.main}30 248deg, transparent 256deg, transparent 270deg, ${p.main}24 278deg, transparent 286deg, transparent 300deg, ${p.main}30 308deg, transparent 316deg, transparent 330deg, ${p.main}24 338deg, transparent 346deg, transparent 360deg)`,
                    maskImage: "radial-gradient(circle, black 0%, transparent 62%)",
                    WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 62%)",
                    animation: "rays-spin 26s linear infinite",
                  }}
                  aria-hidden
                />
              )}
              {/* expanding shockwave rings */}
              {evolutionRevealed &&
                [0, 0.35, 0.7].map((delay) => (
                  <div
                    key={delay}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: "40vmin",
                      height: "40vmin",
                      border: `3px solid ${p.main}aa`,
                      boxShadow: `0 0 30px ${p.glow}`,
                      animation: `shockwave ${1.6 * CONFIG.motionScale}s ease-out ${delay * CONFIG.motionScale}s forwards`,
                      opacity: 0,
                    }}
                    aria-hidden
                  />
                ))}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  style={{
                    animation: evolutionRevealed
                      ? `evolve-in ${1.4 * CONFIG.motionScale}s ease-out forwards`
                      : undefined,
                    filter: evolutionRevealed ? undefined : "brightness(0)",
                  }}
                >
                  <CreatureSprite
                    line={creature.line}
                    stage={victory.xpResult.stage}
                    size={Math.round(260 * CONFIG.creatureScale)}
                  />
                </div>
                {evolutionRevealed && (
                  <div className="anim-rise mt-4 text-center" style={{ animationDelay: `${CONFIG.motionScale}s`, animationFillMode: "both" }}>
                    <p className="eyebrow">evolution</p>
                    <p className="font-display mt-1 text-3xl" style={{ color: p.main }}>
                      {creature.line.stageNames[victory.prevStage]} →{" "}
                      {creature.line.stageNames[victory.xpResult.stage]}
                    </p>
                    <div className="mt-6">
                      <ArcadeButton onClick={() => router.push("/home")} color={p.main} autoFocus>
                        Return home
                      </ArcadeButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- defeat overlay ---- */}
      {phase === "defeat" && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-6 backdrop-blur-sm">
          <div className="panel anim-rise w-full max-w-md p-8 text-center">
            <p className="eyebrow">defeat</p>
            <h2 className="font-display mt-2 text-3xl" style={{ color: "var(--hp)" }}>
              {foe.name} wins…
            </h2>
            <p className="mt-4 text-sm text-dim">
              Every miss you saw comes back in a future battle. Study up — {foe.name} isn&apos;t
              going anywhere.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <ArcadeButton onClick={() => window.location.reload()} color="var(--hp)" autoFocus>
                Rematch
              </ArcadeButton>
              <ArcadeButton onClick={() => router.push("/home")}>Home</ArcadeButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function BattlePage() {
  return (
    <Suspense>
      <BattleScreen />
    </Suspense>
  );
}
