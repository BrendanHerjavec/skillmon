"use client";

import { useEffect, useRef, useState } from "react";
import { overlap } from "@/lib/game/minigames";
import { sfx } from "@/lib/audio/sfx";

// Shard Stack (Craft): a crystal shard glides side to side — drop it on the
// spire with Space or a click. Only the overlapping part survives, so each
// sloppy drop makes the next one harder. Stack all 8 to crown the spire.
//
// Every layer is a faceted crystal with its own light and dark face rather
// than a flat bar, near-perfect drops flash and score a bonus, and landings
// throw sparks.

const W = 460;
const H = 300;
const BLOCK_H = 26;
const START_W = 150;
const TARGET = 8;
/** Centre tolerance (px) that counts as a "perfect" drop. */
const PERFECT = 7;

interface Block {
  x: number;
  w: number;
  perfect: boolean;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function ShardStack({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentX, setCurrentX] = useState(W / 2);
  const [currentW, setCurrentW] = useState(START_W);
  const [won, setWon] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [perfectFlash, setPerfectFlash] = useState(0);

  const t0 = useRef(0);
  const speed = useRef(2.6); // radians per second
  const sparkRef = useRef<Spark[]>([]);
  const sparkId = useRef(0);
  const perfects = useRef(0);

  const start = () => {
    setBlocks([{ x: W / 2, w: START_W, perfect: false }]);
    setCurrentW(START_W);
    setWon(false);
    setSparks([]);
    sparkRef.current = [];
    perfects.current = 0;
    t0.current = Date.now();
    speed.current = 2.6;
    setPhase("playing");
  };

  // Wall-clock oscillation so throttled tabs slow the frame rate, not the game.
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => {
      const amp = (W - currentW) / 2 - 8;
      const t = (Date.now() - t0.current) / 1000;
      setCurrentX(W / 2 + Math.sin(t * speed.current) * amp);
    }, 16);
    return () => clearInterval(iv);
  }, [phase, currentW]);

  // Spark physics.
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => {
      sparkRef.current = sparkRef.current
        .map((s) => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, vy: s.vy + 0.25, life: s.life - 0.05 }))
        .filter((s) => s.life > 0);
      setSparks(sparkRef.current);
    }, 40);
    return () => clearInterval(iv);
  }, [phase]);

  const spark = (x: number, y: number, n = 12) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = 1.5 + Math.random() * 3;
      sparkRef.current.push({
        id: sparkId.current++,
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
      });
    }
  };

  const drop = () => {
    if (phase !== "playing") return;
    const top = blocks[blocks.length - 1];
    const hit = overlap(currentX, currentW, top.x, top.w);
    if (!hit) {
      sfx.penalty();
      setPhase("done");
      return;
    }

    const isPerfect = Math.abs(currentX - top.x) <= PERFECT;
    // A perfect drop keeps the full width — the reward for precision.
    const landed = isPerfect ? { x: top.x, w: top.w, perfect: true } : { x: hit.x, w: hit.w, perfect: false };

    const next = [...blocks, landed];
    setBlocks(next);
    setCurrentW(landed.w);
    speed.current += 0.35;
    spark(landed.x, H - (next.length - 1) * BLOCK_H, isPerfect ? 20 : 10);

    if (isPerfect) {
      perfects.current += 1;
      setPerfectFlash((n) => n + 1);
      sfx.unlock();
    } else {
      sfx.place();
    }

    if (next.length - 1 >= TARGET) {
      setWon(true);
      sfx.victory();
      setPhase("done");
    }
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, blocks, currentX, currentW]);

  useEffect(() => {
    if (phase !== "done") return;
    const stacked = blocks.length - 1;
    onFinish(stacked + perfects.current + (won ? 4 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const stacked = Math.max(0, blocks.length - 1);
  const lift = Math.max(0, (blocks.length + 1) * BLOCK_H - H * 0.62);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  /** A single faceted crystal layer. */
  const Shard = ({ b, i, live }: { b: Block; i: number; live?: boolean }) => {
    const bevel = Math.min(14, b.w * 0.18);
    return (
      <div
        className="absolute"
        style={{
          left: pct(b.x - b.w / 2, W),
          width: pct(b.w, W),
          bottom: pct(i * BLOCK_H, H),
          height: pct(BLOCK_H, H),
          filter: live
            ? "drop-shadow(0 0 14px rgba(192,132,252,0.75))"
            : b.perfect
              ? "drop-shadow(0 0 10px rgba(251,191,36,0.6))"
              : undefined,
        }}
      >
        <svg viewBox={`0 0 ${b.w} ${BLOCK_H}`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id={`sg${i}${live ? "l" : ""}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.perfect ? "#fde68a" : "#e9d5ff"} />
              <stop offset="45%" stopColor={b.perfect ? "#fbbf24" : "#c084fc"} />
              <stop offset="100%" stopColor={b.perfect ? "#b45309" : "#6d28d9"} />
            </linearGradient>
          </defs>
          {/* bevelled crystal slab */}
          <polygon
            points={`${bevel},0 ${b.w - bevel},0 ${b.w},${BLOCK_H / 2} ${b.w - bevel},${BLOCK_H} ${bevel},${BLOCK_H} 0,${BLOCK_H / 2}`}
            fill={`url(#sg${i}${live ? "l" : ""})`}
          />
          {/* top light facet */}
          <polygon
            points={`${bevel},0 ${b.w - bevel},0 ${b.w - bevel * 1.4},${BLOCK_H * 0.42} ${bevel * 1.4},${BLOCK_H * 0.42}`}
            fill="#ffffff"
            opacity="0.28"
          />
          {/* bottom shadow facet */}
          <polygon
            points={`${bevel * 1.4},${BLOCK_H * 0.42} ${b.w - bevel * 1.4},${BLOCK_H * 0.42} ${b.w - bevel},${BLOCK_H} ${bevel},${BLOCK_H}`}
            fill="#1e1035"
            opacity="0.35"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-sm">
        <span className="font-display text-lg" style={{ color: "var(--craft)" }}>
          {stacked}
          <span className="text-xs opacity-70">/{TARGET} shards</span>
        </span>
        {perfectFlash > 0 && (
          <span key={perfectFlash} className="anim-rise font-display text-sm" style={{ color: "var(--influence)" }}>
            perfect!
          </span>
        )}
        <span className="plate-dim">space / click</span>
      </div>

      <div
        onClick={drop}
        className="plate relative w-full max-w-md cursor-pointer select-none overflow-hidden"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* cavern glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 65% 70% at 50% 100%, rgba(192,132,252,0.18), transparent 70%)" }}
          aria-hidden
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#0b0716]/85 backdrop-blur-[2px]">
            <div className="px-6 text-center">
              {phase === "done" && (
                <p className="font-display mb-1 text-2xl" style={{ color: won ? "var(--craft)" : "#e9d5ff" }}>
                  {won ? "Spire complete!" : `${stacked} stacked`}
                </p>
              )}
              <p className="plate-dim text-sm leading-relaxed">
                Drop the gliding shard onto the spire.
                <br />
                Only the overlap survives — dead centre keeps it all.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  start();
                }}
                autoFocus
                className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(175deg,#c084fc,#7c3aed)",
                  boxShadow: "0 6px 18px rgba(124,58,237,0.5)",
                }}
              >
                {phase === "done" ? "Play again" : "Start"}
              </button>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${(lift / H) * 100}%)`, transition: "transform 0.3s ease-out" }}
        >
          {blocks.map((b, i) => (
            <Shard key={i} b={b} i={i} />
          ))}
          {phase === "playing" && (
            <Shard b={{ x: currentX, w: currentW, perfect: false }} i={blocks.length} live />
          )}

          {sparks.map((s) => (
            <span
              key={s.id}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: pct(s.x, W),
                bottom: pct(H - s.y, H),
                width: 4,
                height: 4,
                transform: "translate(-50%,50%)",
                background: "#f5d0fe",
                opacity: s.life,
                boxShadow: "0 0 6px #e9d5ff",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
