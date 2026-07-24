"use client";

import type { SkillType } from "@/lib/game/config";
import type { CreatureLine } from "@/lib/game/types";
import { CreatureSprite, typePalette } from "@/lib/sprites/CreatureSprite";

export const TYPE_LABEL: Record<SkillType, string> = {
  logic: "Logic",
  craft: "Craft",
  influence: "Influence",
};

const TYPE_SOFT: Record<SkillType, string> = {
  logic: "var(--logic-soft)",
  craft: "var(--craft-soft)",
  influence: "var(--influence-soft)",
};

const TYPE_INK: Record<SkillType, string> = {
  logic: "var(--logic)",
  craft: "var(--craft)",
  influence: "var(--influence)",
};

export function TypeBadge({ type }: { type: SkillType }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
      style={{ color: TYPE_INK[type], background: TYPE_SOFT[type] }}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}

/**
 * The signature shot. On the light field-guide surface the creature sits in a
 * dark portrait medallion — which also lets the renders' baked studio backdrop
 * read as deliberate framing rather than a stray dark square.
 */
export function Dais({
  line,
  stage,
  size = 220,
  scale = 1,
  floating = true,
}: {
  line: Pick<CreatureLine, "type" | "seed" | "spriteUrls">;
  stage: number;
  size?: number;
  scale?: number;
  floating?: boolean;
}) {
  const p = typePalette(line.type);
  const s = Math.round(size * scale);
  const plate = Math.round(s * 1.12);

  return (
    <div className="relative flex flex-col items-center" style={{ width: plate }}>
      <div
        className="plate relative grid place-items-center overflow-hidden"
        style={{ width: plate, height: plate }}
      >
        {/* type-tinted key light inside the medallion */}
        <div
          className="anim-pulse-glow pointer-events-none absolute"
          style={{
            width: "88%",
            height: "72%",
            top: "10%",
            background: `radial-gradient(ellipse at 50% 45%, ${p.main}3d 0%, transparent 68%)`,
            filter: "blur(10px)",
          }}
        />
        {/* slow scanline sweep — the one retained arcade cue, now subtle */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            style={{
              width: "100%",
              height: "22%",
              background: `linear-gradient(to bottom, transparent, ${p.main}1f, transparent)`,
              animation: "plate-sweep 6s ease-in-out infinite",
            }}
          />
        </div>

        <div className={`relative z-10 ${floating ? "anim-float" : ""}`}>
          <CreatureSprite line={line} stage={stage} size={Math.round(s * 0.94)} />
        </div>

        {/* rotating energy ring hugging the base of the medallion */}
        <div
          className="pointer-events-none absolute"
          style={{ width: "72%", height: "22%", bottom: "7%" }}
          aria-hidden
        >
          <div
            className="h-full w-full rounded-[50%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${p.main}9e 12%, transparent 27%, transparent 52%, ${p.main}75 64%, transparent 79%)`,
              maskImage:
                "radial-gradient(ellipse, transparent 55%, black 60%, black 74%, transparent 79%)",
              WebkitMaskImage:
                "radial-gradient(ellipse, transparent 55%, black 60%, black 74%, transparent 79%)",
              animation: "ring-spin 10s linear infinite",
            }}
          />
        </div>
      </div>

      {/* contact shadow on the paper */}
      <div
        className="pointer-events-none mt-3"
        style={{
          width: plate * 0.62,
          height: 12,
          background: "radial-gradient(ellipse, rgba(60,44,30,0.2) 0%, transparent 70%)",
          filter: "blur(3px)",
        }}
        aria-hidden
      />
    </div>
  );
}

export function HeartRow({ hearts, max }: { hearts: number; max: number }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${hearts} of ${max} hearts`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path
            d="M12 21 C5 15 2 11 2 7.5 C2 4.5 4.5 2.5 7 2.5 C9 2.5 11 4 12 5.5 C13 4 15 2.5 17 2.5 C19.5 2.5 22 4.5 22 7.5 C22 11 19 15 12 21 Z"
            fill={i < hearts ? "var(--hp)" : "transparent"}
            stroke={i < hearts ? "var(--hp)" : "var(--panel-border)"}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export function Bar({
  value,
  max,
  color,
  height = 10,
  label,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
  label?: string;
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: "var(--bg-deep)" }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(to right, color-mix(in srgb, ${color} 75%, white), ${color})`,
        }}
      />
    </div>
  );
}

/**
 * Primary action. Solid, tactile, with a pressed state — replaces the v1
 * neon-outline arcade button.
 */
export function ArcadeButton({
  children,
  onClick,
  color = "var(--logic)",
  disabled,
  className = "",
  autoFocus,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  variant?: "solid" | "ghost";
}) {
  const solid = variant === "solid";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`cursor-pointer rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={
        solid
          ? {
              color: "#fff",
              background: `linear-gradient(175deg, color-mix(in srgb, ${color} 88%, white), ${color})`,
              boxShadow: `0 1px 0 rgba(255,255,255,0.28) inset, 0 6px 16px color-mix(in srgb, ${color} 32%, transparent)`,
            }
          : {
              color,
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
              boxShadow: "var(--shadow-sm)",
            }
      }
    >
      {children}
    </button>
  );
}
