"use client";

import { useEffect, useRef, useState } from "react";
import { overlap } from "@/lib/game/minigames";

// Shard Stack (Craft): a crystal shard glides side to side — drop it on the
// stack with Space/click. Only the overlapping part survives, so each sloppy
// drop makes the next one harder. Stack all 8 to crown the spire.

const W = 460;
const H = 300;
const BLOCK_H = 26;
const START_W = 150;
const TARGET = 8;

interface Block {
  x: number; // center
  w: number;
}

export function ShardStack({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentX, setCurrentX] = useState(W / 2);
  const [currentW, setCurrentW] = useState(START_W);
  const [won, setWon] = useState(false);
  // Wall-clock phase so oscillation speed survives background-tab timer
  // throttling (the shard just updates less smoothly, never faster/slower).
  const t0 = useRef(0);
  const speed = useRef(2.6); // radians per second
  const dirRef = useRef<HTMLDivElement>(null);

  const start = () => {
    setBlocks([{ x: W / 2, w: START_W }]);
    setCurrentW(START_W);
    setWon(false);
    t0.current = Date.now();
    speed.current = 2.6;
    setPhase("playing");
  };

  // Oscillate the live shard.
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => {
      const amp = (W - currentW) / 2 - 8;
      const t = (Date.now() - t0.current) / 1000;
      setCurrentX(W / 2 + Math.sin(t * speed.current) * amp);
    }, 16);
    return () => clearInterval(iv);
  }, [phase, currentW]);

  const drop = () => {
    if (phase !== "playing") return;
    const top = blocks[blocks.length - 1];
    const hit = overlap(currentX, currentW, top.x, top.w);
    if (!hit) {
      setPhase("done");
      return;
    }
    const next = [...blocks, { x: hit.x, w: hit.w }];
    setBlocks(next);
    setCurrentW(hit.w);
    speed.current += 0.35;
    if (next.length - 1 >= TARGET) {
      setWon(true);
      setPhase("done");
    }
  };

  // Space / Enter to drop.
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
    onFinish(stacked + (won ? 4 : 0)); // perfect spire bonus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const stacked = Math.max(0, blocks.length - 1);
  // Slide the tower down once it climbs past mid-field.
  const lift = Math.max(0, (blocks.length + 1) * BLOCK_H - H * 0.62);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md justify-between text-sm">
        <span className="font-display" style={{ color: "var(--craft)" }}>
          {stacked}/{TARGET} shards
        </span>
        <span className="text-dim">space / click to drop</span>
      </div>

      <div
        ref={dirRef}
        onClick={drop}
        className="plate relative w-full max-w-md cursor-pointer overflow-hidden select-none"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {phase !== "playing" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0e0c14]/80">
            <div className="text-center">
              {phase === "done" && (
                <p className="font-display mb-2 text-lg" style={{ color: won ? "var(--craft)" : "var(--hp)" }}>
                  {won ? "Spire complete!" : `${stacked} stacked`}
                </p>
              )}
              <p className="plate-dim text-sm">
                Drop the gliding shard onto the stack.
                <br />
                Only the overlap survives — build all {TARGET}.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  start();
                }}
                autoFocus
                className="font-display mt-4 cursor-pointer rounded-md border-2 px-5 py-2 text-sm uppercase tracking-widest"
                style={{ color: "var(--craft)", borderColor: "var(--craft)" }}
              >
                {phase === "done" ? "again" : "start"}
              </button>
            </div>
          </div>
        )}

        <div className="absolute inset-0" style={{ transform: `translateY(${(lift / H) * 100}%)`, transition: "transform 0.3s ease-out" }}>
          {/* settled blocks */}
          {blocks.map((b, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${((b.x - b.w / 2) / W) * 100}%`,
                width: `${(b.w / W) * 100}%`,
                bottom: `${((i * BLOCK_H) / H) * 100}%`,
                height: `${(BLOCK_H / H) * 100}%`,
                background: i === 0 ? "var(--panel-border)" : `color-mix(in srgb, var(--craft) ${45 + i * 6}%, #131731)`,
                border: "1px solid #e9d5ff44",
                boxShadow: "0 0 10px #c084fc33",
              }}
            />
          ))}
          {/* live shard */}
          {phase === "playing" && (
            <div
              className="absolute"
              style={{
                left: `${((currentX - currentW / 2) / W) * 100}%`,
                width: `${(currentW / W) * 100}%`,
                bottom: `${((blocks.length * BLOCK_H) / H) * 100}%`,
                height: `${(BLOCK_H / H) * 100}%`,
                background: "var(--craft)",
                border: "1px solid #e9d5ff",
                boxShadow: "0 0 16px #c084fc88",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
