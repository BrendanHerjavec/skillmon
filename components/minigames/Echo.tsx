"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/audio/sfx";

// Echo Chamber (Influence): four star-orbs sing a growing sequence — repeat it
// back. Every completed round is a point; 8 rounds is a perfect echo.
//
// Each orb is a glowing sphere with a real musical pitch, an expanding ripple
// when it sings, and a bloom that lifts it off the dark field.

const PADS = [
  { id: 0, hue: "#fbbf24", deep: "#b45309", note: 523.25 }, // C5
  { id: 1, hue: "#c084fc", deep: "#6d28d9", note: 659.25 }, // E5
  { id: 2, hue: "#34d399", deep: "#047857", note: 783.99 }, // G5
  { id: 3, hue: "#f472b6", deep: "#9d174d", note: 1046.5 }, // C6
];

const MAX_ROUNDS = 8;
const STEP_MS = 520;

export function Echo({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "showing" | "input" | "done">("ready");
  const [sequence, setSequence] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [ripple, setRipple] = useState(0);
  const [progress, setProgress] = useState(0);
  const [won, setWon] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  /** Light an orb and sing its note. */
  const sing = (pad: number) => {
    setLit(pad);
    setRipple((r) => r + 1);
    sfx.pickup((PADS[pad].note - 523) / 60);
  };

  const playSequence = (seq: number[]) => {
    setPhase("showing");
    setProgress(0);
    seq.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => sing(pad), i * STEP_MS),
        setTimeout(() => setLit(null), i * STEP_MS + STEP_MS * 0.6),
      );
    });
    timers.current.push(setTimeout(() => setPhase("input"), seq.length * STEP_MS + 120));
  };

  const nextRound = (seq: number[]) => {
    const grown = [...seq, Math.floor(Math.random() * 4)];
    setSequence(grown);
    timers.current.push(setTimeout(() => playSequence(grown), 500));
  };

  const start = () => {
    clearTimers();
    setWon(false);
    setSequence([]);
    nextRound([]);
  };

  const press = (pad: number) => {
    if (phase !== "input") return;
    sing(pad);
    timers.current.push(setTimeout(() => setLit(null), 200));

    if (pad !== sequence[progress]) {
      sfx.wrong();
      setPhase("done");
      return;
    }
    const p = progress + 1;
    if (p < sequence.length) {
      setProgress(p);
      return;
    }
    if (sequence.length >= MAX_ROUNDS) {
      setWon(true);
      sfx.victory();
      setPhase("done");
    } else {
      sfx.correct();
      setPhase("showing");
      nextRound(sequence);
    }
  };

  const score = phase === "done" ? sequence.length - (won ? 0 : 1) : sequence.length - 1;

  useEffect(() => {
    if (phase === "done") onFinish(Math.max(0, score));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-sm">
        <span className="font-display text-lg" style={{ color: "var(--influence)" }}>
          {Math.max(1, sequence.length)}
          <span className="text-xs opacity-70">/{MAX_ROUNDS}</span>
        </span>
        <span className="plate-dim">
          {phase === "showing" ? "listen…" : phase === "input" ? "your turn" : ""}
        </span>
      </div>

      <div className="plate relative w-full max-w-md overflow-hidden" style={{ aspectRatio: "460 / 300" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(251,191,36,0.10), transparent 70%)" }}
          aria-hidden
        />

        {(phase === "ready" || phase === "done") && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#120d06]/85 backdrop-blur-[2px]">
            <div className="px-6 text-center">
              {phase === "done" && (
                <p className="font-display mb-1 text-2xl" style={{ color: won ? "var(--influence)" : "#fde68a" }}>
                  {won ? "Perfect echo!" : `${Math.max(0, score)} rounds`}
                </p>
              )}
              <p className="plate-dim text-sm leading-relaxed">
                Watch the stars sing,
                <br />
                then repeat the sequence back.
              </p>
              <button
                onClick={start}
                autoFocus
                className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold text-[#241708] transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(175deg,#fde68a,#c2760a)",
                  boxShadow: "0 6px 18px rgba(194,118,10,0.5)",
                }}
              >
                {phase === "done" ? "Play again" : "Start"}
              </button>
            </div>
          </div>
        )}

        <div className="grid h-full grid-cols-2 place-items-center gap-3 p-7">
          {PADS.map((pad) => {
            const on = lit === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => press(pad.id)}
                disabled={phase !== "input"}
                aria-label={`Star ${pad.id + 1}`}
                className="relative grid h-full w-full cursor-pointer place-items-center rounded-2xl transition-all duration-150 disabled:cursor-default"
                style={{
                  background: on
                    ? `radial-gradient(circle at 40% 35%, ${pad.hue}, ${pad.deep})`
                    : `radial-gradient(circle at 40% 35%, ${pad.deep}, #17121f)`,
                  boxShadow: on
                    ? `0 0 34px ${pad.hue}bb, inset 0 1px 0 rgba(255,255,255,0.35)`
                    : "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.5)",
                  transform: on ? "scale(1.06)" : "scale(1)",
                }}
              >
                {/* ripple on sing */}
                {on && (
                  <span
                    key={ripple}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: "60%",
                      height: "60%",
                      border: `2px solid ${pad.hue}`,
                      animation: "shockwave 0.6s ease-out forwards",
                    }}
                  />
                )}
                <svg viewBox="0 0 48 48" width="46" height="46" aria-hidden>
                  <defs>
                    <radialGradient id={`st${pad.id}`} cx="38%" cy="32%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor={pad.hue} />
                      <stop offset="100%" stopColor={pad.deep} />
                    </radialGradient>
                  </defs>
                  <path
                    d="M24 4 L29.5 17.5 L44 18.5 L32.8 27.8 L36.5 42 L24 34 L11.5 42 L15.2 27.8 L4 18.5 L18.5 17.5 Z"
                    fill={`url(#st${pad.id})`}
                    opacity={on ? 1 : 0.55}
                  />
                  <circle cx="19" cy="17" r="3" fill="#fff" opacity={on ? 0.75 : 0.25} />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
