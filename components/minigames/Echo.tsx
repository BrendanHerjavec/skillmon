"use client";

import { useEffect, useRef, useState } from "react";

// Echo Chamber (Influence): four stars sing a growing sequence — repeat it
// back. Every completed round is a point; 8 rounds is a perfect echo.

const PADS = [
  { id: 0, color: "var(--influence)", glow: "#fbbf24" },
  { id: 1, color: "var(--craft)", glow: "#c084fc" },
  { id: 2, color: "var(--logic)", glow: "#34d399" },
  { id: 3, color: "var(--xp)", glow: "#60a5fa" },
];

const MAX_ROUNDS = 8;
const STEP_MS = 520;

export function Echo({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "showing" | "input" | "done">("ready");
  const [sequence, setSequence] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [won, setWon] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const playSequence = (seq: number[]) => {
    setPhase("showing");
    setProgress(0);
    seq.forEach((pad, i) => {
      timers.current.push(
        setTimeout(() => setLit(pad), i * STEP_MS),
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
    setLit(pad);
    timers.current.push(setTimeout(() => setLit(null), 200));

    if (pad !== sequence[progress]) {
      setPhase("done");
      return;
    }
    const p = progress + 1;
    if (p < sequence.length) {
      setProgress(p);
      return;
    }
    // Round complete.
    if (sequence.length >= MAX_ROUNDS) {
      setWon(true);
      setPhase("done");
    } else {
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
      <div className="flex w-full max-w-md justify-between text-sm">
        <span className="font-display" style={{ color: "var(--influence)" }}>
          round {Math.max(1, sequence.length)}/{MAX_ROUNDS}
        </span>
        <span className="text-dim">
          {phase === "showing" ? "listen…" : phase === "input" ? "your turn" : " "}
        </span>
      </div>

      <div className="plate relative w-full max-w-md overflow-hidden" style={{ aspectRatio: "460 / 300" }}>
        {(phase === "ready" || phase === "done") && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0e0c14]/80">
            <div className="text-center">
              {phase === "done" && (
                <p className="font-display mb-2 text-lg" style={{ color: won ? "var(--influence)" : "var(--hp)" }}>
                  {won ? "Perfect echo!" : `${Math.max(0, score)} rounds echoed`}
                </p>
              )}
              <p className="plate-dim text-sm">
                Watch the stars light up,
                <br />
                then repeat the sequence back.
              </p>
              <button
                onClick={start}
                autoFocus
                className="font-display mt-4 cursor-pointer rounded-md border-2 px-5 py-2 text-sm uppercase tracking-widest"
                style={{ color: "var(--influence)", borderColor: "var(--influence)" }}
              >
                {phase === "done" ? "again" : "start"}
              </button>
            </div>
          </div>
        )}

        <div className="grid h-full grid-cols-2 place-items-center gap-4 p-8">
          {PADS.map((pad) => (
            <button
              key={pad.id}
              onClick={() => press(pad.id)}
              disabled={phase !== "input"}
              aria-label={`Star ${pad.id + 1}`}
              className="grid h-full w-full cursor-pointer place-items-center rounded-lg border-2 transition-all disabled:cursor-default"
              style={{
                borderColor: lit === pad.id ? pad.glow : "#3a3550",
                background: lit === pad.id ? `color-mix(in srgb, ${pad.glow} 30%, transparent)` : "#221f2e",
                boxShadow: lit === pad.id ? `0 0 24px ${pad.glow}aa` : "none",
                transform: lit === pad.id ? "scale(1.04)" : "scale(1)",
              }}
            >
              <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
                <path
                  d="M20 4 L24.5 15 L36 15.5 L27 23 L30 35 L20 28 L10 35 L13 23 L4 15.5 L15.5 15 Z"
                  fill={lit === pad.id ? pad.glow : pad.color}
                  opacity={lit === pad.id ? 1 : 0.55}
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
