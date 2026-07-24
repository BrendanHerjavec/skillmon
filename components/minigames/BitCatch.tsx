"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CreatureLine } from "@/lib/game/types";
import { CreatureSprite } from "@/lib/sprites/CreatureSprite";

// Bit Catch (Logic): steer the creature to catch falling clean bits (+1) and
// dodge red bugs (−2). 30 seconds, arrows or mouse. Score feeds habitat mood.

const W = 460;
const H = 300;
const PLAYER_W = 76;
const CATCH_Y = H - 78;
const DURATION = 30;

interface Falling {
  id: number;
  x: number;
  y: number;
  bug: boolean;
  speed: number;
}

export function BitCatch({
  line,
  onFinish,
  auto = false,
}: {
  line: CreatureLine;
  onFinish: (score: number) => void;
  /** Auto-demo: start on its own and steer toward the nearest clean bit. */
  auto?: boolean;
}) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [items, setItems] = useState<Falling[]>([]);
  const [playerX, setPlayerX] = useState(W / 2);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  // Game-loop state lives in refs so the tick can do its side effects
  // (spawning, catch detection) exactly once per interval — never inside a
  // setState updater, which React dev-mode double-invokes.
  const itemsRef = useRef<Falling[]>([]);
  const nextId = useRef(0);
  const spawnAt = useRef(0);
  const startedAt = useRef(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerXRef = useRef(W / 2);
  playerXRef.current = playerX;

  const start = () => {
    setScore(0);
    setTimeLeft(DURATION);
    itemsRef.current = [];
    setItems([]);
    spawnAt.current = 0;
    startedAt.current = Date.now();
    setPhase("playing");
  };

  // One game tick: clock, fall, catch, spawn — all side effects here.
  // Movement is delta-time based and catches use swept collision (segment vs
  // band), so browser timer throttling (backgrounded tabs run intervals at
  // ~1Hz) slows the action without ever breaking it.
  useEffect(() => {
    if (phase !== "playing") return;
    let last = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(100, now - last); // cap: throttled tabs slow down, never teleport
      last = now;
      const elapsed = (now - startedAt.current) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(DURATION - elapsed)));
      if (elapsed >= DURATION) {
        setPhase("done");
        return;
      }

      const step = dt / 40; // speeds are tuned per 40ms tick
      let next = itemsRef.current.map((f) => ({ ...f, y: f.y + f.speed * step }));

      // Swept catch check: did the segment [previous y, new y] cross the
      // catch band while x-aligned with the player?
      const px = playerXRef.current;
      const caught = next.filter((f) => {
        const prevY = f.y - f.speed * step;
        return (
          f.y >= CATCH_Y && prevY < CATCH_Y + 34 && Math.abs(f.x - px) < PLAYER_W / 2 + 10
        );
      });
      if (caught.length > 0) {
        const delta = caught.reduce((acc, f) => acc + (f.bug ? -2 : 1), 0);
        setScore((s) => Math.max(0, s + delta));
        setFlash(caught.some((f) => f.bug) ? "bad" : "good");
        setTimeout(() => setFlash(null), 250);
        next = next.filter((f) => !caught.includes(f));
      }
      next = next.filter((f) => f.y < H + 20);

      // Spawn cadence ramps up as the clock runs down.
      spawnAt.current -= dt;
      if (spawnAt.current <= 0) {
        spawnAt.current = Math.max(300, 720 - elapsed * 14);
        next.push({
          id: nextId.current++,
          x: 30 + Math.random() * (W - 60),
          y: -14,
          bug: Math.random() < 0.22,
          speed: 3.2 + Math.random() * 2 + elapsed * 0.07,
        });
      }

      // Auto-demo: chase the lowest clean bit. Proportional (ease toward the
      // target) rather than a fixed px/tick cap, so it converges in a handful
      // of frames normally and still lands its catches when the browser
      // throttles timers in a background tab.
      if (auto) {
        const targets = next.filter((f) => !f.bug && f.y < CATCH_Y);
        if (targets.length > 0) {
          const target = targets.reduce((a, b) => (a.y > b.y ? a : b));
          const cur = playerXRef.current;
          const nextX = Math.max(
            PLAYER_W / 2,
            Math.min(W - PLAYER_W / 2, cur + (target.x - cur) * Math.min(1, 0.4 * step)),
          );
          playerXRef.current = nextX;
          setPlayerX(nextX);
        }
      }

      itemsRef.current = next;
      setItems(next);
    }, 40);
    return () => clearInterval(iv);
  }, [phase, auto]);

  // Auto-demo starts itself.
  useEffect(() => {
    if (!auto || phase !== "ready") return;
    const t = setTimeout(start, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, phase]);

  // Keyboard + mouse steering.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPlayerX((x) => Math.max(PLAYER_W / 2, x - 28));
      if (e.key === "ArrowRight") setPlayerX((x) => Math.min(W - PLAYER_W / 2, x + 28));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const onMove = useCallback((clientX: number) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * W;
    setPlayerX(Math.max(PLAYER_W / 2, Math.min(W - PLAYER_W / 2, x)));
  }, []);

  useEffect(() => {
    if (phase === "done") onFinish(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md justify-between text-sm">
        <span className="font-display" style={{ color: "var(--logic)" }}>
          {score} bits
        </span>
        <span className="text-dim">{phase === "playing" ? `${timeLeft}s` : `${DURATION}s`}</span>
      </div>

      <div
        ref={fieldRef}
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        className="plate relative w-full max-w-md touch-none overflow-hidden"
        style={{
          aspectRatio: `${W} / ${H}`,
          borderColor: flash === "good" ? "var(--logic)" : flash === "bad" ? "var(--hp)" : undefined,
          cursor: phase === "playing" ? "none" : undefined,
        }}
      >
        {phase !== "playing" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0e0c14]/80">
            <div className="text-center">
              <p className="plate-dim text-sm">
                Catch <span style={{ color: "var(--logic)" }}>■ bits</span> (+1), dodge{" "}
                <span style={{ color: "var(--hp)" }}>● bugs</span> (−2).
                <br />
                Move with ← → or the mouse.
              </p>
              <button
                onClick={start}
                autoFocus
                className="font-display mt-4 cursor-pointer rounded-md border-2 px-5 py-2 text-sm uppercase tracking-widest"
                style={{ color: "var(--logic)", borderColor: "var(--logic)" }}
              >
                {phase === "done" ? "again" : "start"}
              </button>
            </div>
          </div>
        )}

        {items.map((f) =>
          f.bug ? (
            <span
              key={f.id}
              className="absolute grid h-5 w-5 place-items-center rounded-full text-[10px]"
              style={{ left: `${(f.x / W) * 100}%`, top: `${(f.y / H) * 100}%`, transform: "translate(-50%,-50%)", background: "var(--hp)", color: "#1a0505" }}
            >
              ✕
            </span>
          ) : (
            <span
              key={f.id}
              className="absolute h-4 w-4 rounded-sm"
              style={{ left: `${(f.x / W) * 100}%`, top: `${(f.y / H) * 100}%`, transform: "translate(-50%,-50%) rotate(45deg)", background: "var(--logic)", boxShadow: "0 0 8px #34d39988" }}
            />
          ),
        )}

        {/* player */}
        <div
          className="absolute"
          style={{ left: `${(playerX / W) * 100}%`, bottom: 2, transform: "translateX(-50%)", transition: "left 60ms linear" }}
        >
          <CreatureSprite line={line} stage={0} size={PLAYER_W} />
        </div>
      </div>
    </div>
  );
}
