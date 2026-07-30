"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CreatureLine } from "@/lib/game/types";
import { CreatureSprite } from "@/lib/sprites/CreatureSprite";
import { sfx } from "@/lib/audio/sfx";

// Bit Catch (Logic): steer the creature to catch falling data gems (+1) and
// dodge bug demons (−2). 30 seconds.
//
// Visual bar is set by the 3D creature renders, so nothing here is a flat
// rectangle: gems are faceted and spin with motion trails, bugs are animated
// little brutes, catches throw particles, and the field has a perspective
// grid floor for depth.

const W = 460;
const H = 300;
const PLAYER_W = 78;
const CATCH_Y = H - 78;
const DURATION = 30;

interface Falling {
  id: number;
  x: number;
  y: number;
  bug: boolean;
  speed: number;
  spin: number;
  /** recent y positions, for the motion trail */
  trail: number[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: string;
}

export function BitCatch({
  line,
  onFinish,
  auto = false,
}: {
  line: CreatureLine;
  onFinish: (score: number) => void;
  /** Auto-demo: start on its own and steer toward the nearest clean gem. */
  auto?: boolean;
}) {
  const [phase, setPhase] = useState<"ready" | "playing" | "done">("ready");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [items, setItems] = useState<Falling[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [playerX, setPlayerX] = useState(W / 2);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const itemsRef = useRef<Falling[]>([]);
  const partRef = useRef<Particle[]>([]);
  const nextId = useRef(0);
  const spawnAt = useRef(0);
  const startedAt = useRef(0);
  const comboRef = useRef(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const playerXRef = useRef(W / 2);
  playerXRef.current = playerX;

  const start = () => {
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    setTimeLeft(DURATION);
    itemsRef.current = [];
    partRef.current = [];
    setItems([]);
    setParticles([]);
    spawnAt.current = 0;
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const burst = (x: number, y: number, hue: string, n = 10) => {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const sp = 1.6 + Math.random() * 2.4;
      partRef.current.push({
        id: nextId.current++,
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1,
        life: 1,
        hue,
      });
    }
  };

  // One tick: clock, motion, catches, spawning, particles. Delta-time based
  // and swept, so background-tab timer throttling slows it without breaking it.
  useEffect(() => {
    if (phase !== "playing") return;
    let last = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(100, now - last);
      last = now;
      const elapsed = (now - startedAt.current) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(DURATION - elapsed)));
      if (elapsed >= DURATION) {
        setPhase("done");
        return;
      }

      const step = dt / 40;
      let next = itemsRef.current.map((f) => ({
        ...f,
        y: f.y + f.speed * step,
        spin: f.spin + step * 9,
        trail: [f.y, ...f.trail].slice(0, 4),
      }));

      const px = playerXRef.current;
      const caught = next.filter((f) => {
        const prevY = f.y - f.speed * step;
        return f.y >= CATCH_Y && prevY < CATCH_Y + 34 && Math.abs(f.x - px) < PLAYER_W / 2 + 10;
      });

      if (caught.length > 0) {
        let delta = 0;
        let anyBug = false;
        for (const f of caught) {
          if (f.bug) {
            delta -= 2;
            anyBug = true;
            comboRef.current = 0;
            burst(f.x, f.y, "#f87171", 12);
            sfx.penalty();
          } else {
            delta += 1;
            comboRef.current += 1;
            burst(f.x, f.y, "#34d399", 10);
            sfx.pickup(Math.min(comboRef.current, 8));
          }
        }
        setCombo(comboRef.current);
        setScore((s) => Math.max(0, s + delta));
        setFlash(anyBug ? "bad" : "good");
        setTimeout(() => setFlash(null), 220);
        next = next.filter((f) => !caught.includes(f));
      }
      next = next.filter((f) => f.y < H + 20);

      spawnAt.current -= dt;
      if (spawnAt.current <= 0) {
        spawnAt.current = Math.max(300, 720 - elapsed * 14);
        next.push({
          id: nextId.current++,
          x: 30 + Math.random() * (W - 60),
          y: -14,
          bug: Math.random() < 0.22,
          speed: 3.2 + Math.random() * 2 + elapsed * 0.07,
          spin: Math.random() * 360,
          trail: [],
        });
      }

      // Auto-demo: ease toward the lowest clean gem.
      if (auto) {
        const targets = next.filter((f) => !f.bug && f.y < CATCH_Y);
        if (targets.length > 0) {
          const target = targets.reduce((a, b) => (a.y > b.y ? a : b));
          const cur = playerXRef.current;
          const nx = Math.max(
            PLAYER_W / 2,
            Math.min(W - PLAYER_W / 2, cur + (target.x - cur) * Math.min(1, 0.4 * step)),
          );
          playerXRef.current = nx;
          setPlayerX(nx);
        }
      }

      partRef.current = partRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * step,
          y: p.y + p.vy * step,
          vy: p.vy + 0.22 * step,
          life: p.life - 0.045 * step,
        }))
        .filter((p) => p.life > 0);

      itemsRef.current = next;
      setItems(next);
      setParticles(partRef.current);
    }, 40);
    return () => clearInterval(iv);
  }, [phase, auto]);

  useEffect(() => {
    if (!auto || phase !== "ready") return;
    const t = setTimeout(start, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, phase]);

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

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full max-w-md items-center justify-between text-sm">
        <span className="font-display text-lg" style={{ color: "var(--logic)" }}>
          {score} <span className="text-xs opacity-70">bits</span>
        </span>
        {combo >= 2 && (
          <span
            key={combo}
            className="anim-rise font-display text-sm"
            style={{ color: "var(--influence)" }}
          >
            ×{combo} combo
          </span>
        )}
        <span className="plate-dim tabular-nums">{phase === "playing" ? timeLeft : DURATION}s</span>
      </div>

      <div
        ref={fieldRef}
        onMouseMove={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        className="plate relative w-full max-w-md touch-none overflow-hidden"
        style={{
          aspectRatio: `${W} / ${H}`,
          cursor: phase === "playing" ? "none" : undefined,
          boxShadow:
            flash === "good"
              ? "inset 0 0 40px rgba(52,211,153,0.45)"
              : flash === "bad"
                ? "inset 0 0 40px rgba(248,113,113,0.5)"
                : undefined,
          transition: "box-shadow 120ms",
        }}
      >
        {/* perspective grid floor for depth */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              "repeating-linear-gradient(to right, rgba(52,211,153,0.16) 0 1px, transparent 1px 42px), linear-gradient(to bottom, transparent, rgba(52,211,153,0.12))",
            transform: "perspective(240px) rotateX(58deg)",
            transformOrigin: "bottom",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(52,211,153,0.10), transparent 70%)" }}
          aria-hidden
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#080d16]/85 backdrop-blur-[2px]">
            <div className="px-6 text-center">
              {phase === "done" && (
                <p className="font-display mb-1 text-2xl" style={{ color: "var(--logic)" }}>
                  {score} bits
                </p>
              )}
              <p className="plate-dim text-sm leading-relaxed">
                Catch the <span style={{ color: "#6ee7b7" }}>data gems</span>, dodge the{" "}
                <span style={{ color: "#fca5a5" }}>bugs</span>.
                <br />
                Move with ← → or your mouse.
              </p>
              <button
                onClick={start}
                autoFocus
                className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold text-[#062018] transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(175deg,#6ee7b7,#0e9f6e)",
                  boxShadow: "0 6px 18px rgba(14,159,110,0.45)",
                }}
              >
                {phase === "done" ? "Play again" : "Start"}
              </button>
            </div>
          </div>
        )}

        {/* falling items */}
        {items.map((f) => (
          <span key={f.id}>
            {/* motion trail */}
            {f.trail.map((ty, i) => (
              <span
                key={i}
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: pct(f.x, W),
                  top: pct(ty, H),
                  width: 10 - i * 2,
                  height: 10 - i * 2,
                  transform: "translate(-50%,-50%)",
                  background: f.bug ? "#f87171" : "#34d399",
                  opacity: 0.16 - i * 0.03,
                  filter: "blur(2px)",
                }}
              />
            ))}
            {f.bug ? (
              // bug demon
              <svg
                className="absolute"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                style={{ left: pct(f.x, W), top: pct(f.y, H), transform: `translate(-50%,-50%) rotate(${Math.sin(f.spin / 30) * 14}deg)` }}
                aria-hidden
              >
                <ellipse cx="12" cy="19" rx="6" ry="1.6" fill="#000" opacity="0.35" />
                <path d="M6 8 L3 3 L8.5 6 Z M18 8 L21 3 L15.5 6 Z" fill="#991b1b" />
                <circle cx="12" cy="12" r="7.5" fill="#ef4444" />
                <circle cx="12" cy="12" r="7.5" fill="url(#bugshade)" />
                <defs>
                  <radialGradient id="bugshade" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="60%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </radialGradient>
                </defs>
                <circle cx="9.5" cy="11" r="2" fill="#fff" />
                <circle cx="14.5" cy="11" r="2" fill="#fff" />
                <circle cx="9.8" cy="11.3" r="1" fill="#1a0505" />
                <circle cx="14.8" cy="11.3" r="1" fill="#1a0505" />
                <path d="M9 15.5 L10.5 14.2 L12 15.5 L13.5 14.2 L15 15.5" stroke="#fecaca" strokeWidth="1.1" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              // data gem
              <svg
                className="absolute"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                style={{
                  left: pct(f.x, W),
                  top: pct(f.y, H),
                  transform: `translate(-50%,-50%) rotate(${f.spin}deg)`,
                  filter: "drop-shadow(0 0 6px rgba(52,211,153,0.85))",
                }}
                aria-hidden
              >
                <defs>
                  <linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d1fae5" />
                    <stop offset="45%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <polygon points="12,2 21,9 12,22 3,9" fill="url(#gemg)" />
                <polygon points="12,2 21,9 12,9" fill="#ecfdf5" opacity="0.55" />
                <polygon points="12,9 12,22 3,9" fill="#065f46" opacity="0.4" />
              </svg>
            )}
          </span>
        ))}

        {/* particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: pct(p.x, W),
              top: pct(p.y, H),
              width: 5,
              height: 5,
              transform: "translate(-50%,-50%)",
              background: p.hue,
              opacity: p.life,
              boxShadow: `0 0 6px ${p.hue}`,
            }}
          />
        ))}

        {/* player */}
        <div
          className="absolute z-10"
          style={{
            left: pct(playerX, W),
            bottom: 2,
            transform: "translateX(-50%)",
            transition: "left 60ms linear",
            filter: "drop-shadow(0 0 12px rgba(52,211,153,0.35))",
          }}
        >
          <CreatureSprite line={line} stage={0} size={PLAYER_W} blend />
        </div>
      </div>
    </div>
  );
}
