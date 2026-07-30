"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STARTERS } from "@/content/starters";
import { DEMO_MODE } from "@/lib/game/config";
import { CreatureSprite } from "@/lib/sprites/CreatureSprite";
import { loadSave, useSave } from "@/lib/state/save";
import { beat, setAuto, startAutopilot, useAutopilot } from "@/lib/state/autopilot";

export default function TitleScreen() {
  const router = useRouter();
  const auto = useAutopilot();
  const { reset } = useSave();

  const start = () => {
    const save = loadSave();
    router.push(save.creature ? "/home" : "/starter");
  };

  /** Auto-demo always begins from a clean save so the full arc is on camera. */
  const beginTour = useCallback(
    (full: boolean) => {
      reset();
      startAutopilot(full);
      setAuto({ caption: "SKILLMON — a creature that levels up when you actually do." });
    },
    [reset],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the URL, hit record, walk away.
  //   /?auto=1     → 90-second film cut (ends on the evolved hero shot)
  //   /?auto=full  → full tour (adds habitat, mini-game, dex)
  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("auto");
    if (mode === "1" || mode === "film") beginTour(false);
    else if (mode === "full") beginTour(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tour step: linger on the logo, then head to starter select.
  useEffect(() => {
    if (!auto.active) return;
    const t = setTimeout(() => router.push("/starter"), beat(2200));
    return () => clearTimeout(t);
  }, [auto.active, router]);

  return (
    <main
      className="relative flex min-h-dvh cursor-pointer flex-col items-center justify-center overflow-hidden px-6"
      onClick={start}
    >
      {/* Floating collectible tokens. The renders carry a dark studio backdrop,
          so each sits in its own medallion rather than washing out on paper. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[
          { line: STARTERS[0], size: 128, pos: "left-[7%] top-[16%]", delay: "0s" },
          { line: STARTERS[1], size: 108, pos: "right-[9%] top-[26%]", delay: "1.3s" },
          { line: STARTERS[2], size: 116, pos: "bottom-[13%] left-[19%]", delay: "2.1s" },
        ].map((t) => (
          <div
            key={t.line.id}
            className={`anim-float plate absolute grid place-items-center rounded-full ${t.pos}`}
            style={{ width: t.size, height: t.size, animationDelay: t.delay, opacity: 0.9 }}
          >
            <CreatureSprite line={t.line} stage={0} size={Math.round(t.size * 0.92)} />
          </div>
        ))}
      </div>

      <p className="eyebrow anim-rise mb-5">52-week build · week one</p>

      <h1
        className="font-display anim-rise text-center text-6xl font-black leading-[0.95] sm:text-8xl"
        style={{ animationDelay: "0.1s" }}
      >
        <span style={{ color: "var(--text)" }}>Skill</span>
        <span
          style={{
            background: "linear-gradient(115deg, var(--logic), var(--craft) 52%, var(--influence))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          mon
        </span>
      </h1>

      <p
        className="anim-rise mt-6 max-w-md text-center text-[17px] leading-relaxed text-dim"
        style={{ animationDelay: "0.2s" }}
      >
        A creature collector that runs on your real life. Learn a skill, prove it in a
        quiz battle, and watch your creature evolve.
      </p>

      <button
        className="anim-blink mt-12 text-sm font-bold uppercase tracking-[0.28em] text-ink"
        onClick={start}
      >
        Press start
      </button>

      {DEMO_MODE && !auto.active && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {([false, true] as const).map((full) => (
            <button
              key={String(full)}
              className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-dim transition-colors hover:text-ink"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--panel-border)",
                boxShadow: "var(--shadow-sm)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                beginTour(full);
              }}
            >
              {full ? "▶▶ Full tour · 70s" : "▶▶ Quick demo · 50s"}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
