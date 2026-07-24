"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ARENAS } from "@/content/arenas";
import { CONFIG, DEMO_MODE } from "@/lib/game/config";
import { xpToNext } from "@/lib/game/xp";
import { useSave } from "@/lib/state/save";
import { ArcadeButton, Bar, Dais, TypeBadge } from "@/components/ui";
import { typePalette } from "@/lib/sprites/CreatureSprite";
import { DemoPanel } from "@/components/DemoPanel";
import { beat, setAuto, stopAutopilot, useAutopilot } from "@/lib/state/autopilot";

export default function HomeScreen() {
  const router = useRouter();
  const { save, reset, loaded } = useSave();
  const auto = useAutopilot();
  const stage = save?.creature?.stage;

  // Redirect in an effect — navigating during render warns and can loop.
  useEffect(() => {
    if (loaded && !save?.creature) router.replace("/starter");
  }, [loaded, save?.creature, router]);

  // Tour hub: battle until the creature evolves, then show off the habitat,
  // then the dex. Driven by real save state, so it self-corrects if the XP
  // curve changes (the battle cap is just a runaway guard).
  useEffect(() => {
    if (!auto.active || !save?.creature) return;
    const c = save.creature;
    let t: ReturnType<typeof setTimeout>;

    if (c.stage === 0 && auto.battlesDone < 3) {
      setAuto({
        caption:
          auto.battlesDone === 0
            ? `This is ${c.line.stageNames[0]} — its power comes from what you know about ${c.line.skillName}.`
            : `Lv ${c.level}. One more win to evolve.`,
      });
      t = setTimeout(() => router.push("/battle?arena=1"), beat(3400));
    } else if (!auto.full) {
      // 90-second film cut: rest on the evolved hero shot and hand back control.
      setAuto({
        caption: `${c.line.stageNames[c.stage]}, Lv ${c.level}. You leveled up, so it did too.`,
      });
      t = setTimeout(stopAutopilot, beat(6000));
    } else if (!auto.seenHabitat) {
      setAuto({ caption: "Evolved. Every win also changes where it lives." });
      t = setTimeout(() => router.push("/habitat"), beat(4200));
    } else {
      setAuto({ caption: "Every creature line you discover is recorded in the Dex." });
      t = setTimeout(() => router.push("/dex"), beat(3400));
    }
    return () => clearTimeout(t);
  }, [auto.active, auto.battlesDone, auto.seenHabitat, auto.full, stage, save?.creature, router]);

  if (!loaded || !save?.creature) return <main className="min-h-dvh" />;

  const c = save.creature;
  const p = typePalette(c.line.type);
  const need = xpToNext(c.level);
  const nextArena = ARENAS.find((a) => a.playable && !save.badges.includes(a.number)) ?? ARENAS[0];

  return (
    <main className="mx-auto grid min-h-dvh max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.2fr_1fr]">
      {/* ---- signature shot ---- */}
      <section className="flex flex-col items-center justify-center">
        <p className="eyebrow">{c.line.skillName} · stage {c.stage}</p>
        <h1 className="font-display mt-1 text-5xl font-bold" style={{ color: p.main }}>
          {c.line.stageNames[c.stage]}
        </h1>
        <div className="mt-5">
          <Dais line={c.line} stage={c.stage} size={288} scale={CONFIG.creatureScale} />
        </div>

        <div className="panel mt-7 w-full max-w-md p-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-bold">Lv {c.level}</span>
            <TypeBadge type={c.line.type} />
          </div>
          <div className="mt-3">
            <Bar value={c.xp} max={need} color="var(--xp)" label="XP progress" />
            <div className="mt-1 flex justify-between text-xs text-dim">
              <span>{c.xp} / {need} XP</span>
              <span>
                {c.stage < 2
                  ? `evolves at Lv ${CONFIG.evolutionLevels[c.stage]}`
                  : "final form"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-dim">
            <span>WINS {c.wins}</span>
            <span>LOSSES {c.losses}</span>
            <span>BADGES {save.badges.length}/8</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <ArcadeButton
            color={p.main}
            onClick={() => router.push(`/battle?arena=${nextArena.number}`)}
            className="text-base"
          >
            ⚔ Battle
          </ArcadeButton>
          <Link href="/habitat" className="eyebrow underline-offset-4 hover:underline">
            Habitat
          </Link>
          <Link href="/dex" className="eyebrow underline-offset-4 hover:underline">
            Dex
          </Link>
          {DEMO_MODE && (
            <button
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="eyebrow cursor-pointer text-hp/80 underline-offset-4 hover:underline"
            >
              Reset save
            </button>
          )}
        </div>
      </section>

      {/* ---- arena ladder ---- */}
      <section className="flex flex-col justify-center gap-3">
        <p className="eyebrow mb-1">arenas</p>
        {ARENAS.map((a) => {
          const earned = save.badges.includes(a.number);
          const locked = !a.playable && !save.flags?.allArenas;
          return (
            <div
              key={a.number}
              className={`panel flex items-center gap-4 p-4 ${locked ? "opacity-45" : ""}`}
            >
              <span
                className="font-display grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 text-sm"
                style={
                  earned
                    ? { borderColor: "var(--influence)", color: "var(--influence)", boxShadow: "0 0 12px #fbbf2466" }
                    : { borderColor: "var(--panel-border)", color: "var(--text-dim)" }
                }
              >
                {earned ? "★" : a.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.name}</p>
                <p className="truncate text-xs text-dim">
                  {a.leader} — {a.leaderTitle}
                </p>
              </div>
              {locked ? (
                <span className="eyebrow shrink-0">locked</span>
              ) : (
                <Link
                  href={`/battle?arena=${a.number}`}
                  className="eyebrow shrink-0 rounded-sm border-2 border-panel-border px-3 py-1.5 hover:border-xp hover:text-ink"
                >
                  {earned ? "rematch" : "enter"}
                </Link>
              )}
            </div>
          );
        })}
      </section>
      <DemoPanel />
    </main>
  );
}
