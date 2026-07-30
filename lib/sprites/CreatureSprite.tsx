"use client";

import { useId } from "react";
import type { SkillType } from "@/lib/game/config";
import type { CreatureLine } from "@/lib/game/types";

// Procedural creature art, v2 — "holographic pet" rendering. Every mass is
// shaded with a radial body gradient (light core → mid → dark rim), carries a
// specular gloss, sits in a soft animated aura, and blinks. Gradient/filter
// ids are scoped per instance via useId so many sprites can share a page.
// Generated raster art (Nano Banana pipeline → spriteUrls) still wins when
// present; run `npm run sprites` with a GEMINI_API_KEY to produce it.

interface Palette {
  main: string;
  dark: string;
  light: string;
  glow: string;
}

const PALETTES: Record<SkillType, Palette> = {
  logic: { main: "#34D399", dark: "#0B7A55", light: "#B9FBE0", glow: "#34D39980" },
  craft: { main: "#C084FC", dark: "#6D28D9", light: "#EDDCFF", glow: "#C084FC80" },
  influence: { main: "#FBBF24", dark: "#B45309", light: "#FEF3C7", glow: "#FBBF2480" },
};

/** Paint handles passed to each stage drawing. */
interface Paint {
  p: Palette;
  body: string; // url(#...) radial body gradient
  belly: string; // softer secondary gradient
  sheen: string; // white specular gradient
}

function Eyes({
  cx,
  cy,
  gap,
  r,
  paint,
}: {
  cx: number;
  cy: number;
  gap: number;
  r: number;
  paint: Paint;
}) {
  const iris = "#101426";
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          {/* white with a soft blink (ry squash) */}
          <ellipse cx={cx + s * gap} cy={cy} rx={r} ry={r} fill="#fff">
            <animate
              attributeName="ry"
              values={`${r};${r};${r * 0.06};${r};${r}`}
              keyTimes="0;0.46;0.5;0.54;1"
              dur="4.6s"
              repeatCount="indefinite"
            />
          </ellipse>
          <circle cx={cx + s * gap + r * 0.22} cy={cy + r * 0.12} r={r * 0.58} fill={iris} />
          <circle cx={cx + s * gap + r * 0.22} cy={cy + r * 0.12} r={r * 0.32} fill={paint.p.dark} opacity="0.85" />
          <circle cx={cx + s * gap + r * 0.42} cy={cy - r * 0.22} r={r * 0.2} fill="#fff" />
          <circle cx={cx + s * gap + r * 0.05} cy={cy + r * 0.4} r={r * 0.1} fill="#fff" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

/** Soft specular blob — the "glossy 3D" read. */
function Gloss({ cx, cy, rx, ry, paint, rotate = -18 }: { cx: number; cy: number; rx: number; ry: number; paint: Paint; rotate?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={paint.sheen}
      transform={`rotate(${rotate} ${cx} ${cy})`}
    />
  );
}

/* ---------------- Logic: the serpent line ---------------- */

function LogicStage0({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <path d="M128 150 Q160 145 152 118" stroke={p.dark} strokeWidth="14" fill="none" strokeLinecap="round" />
      <ellipse cx="98" cy="132" rx="46" ry="42" fill={paint.body} />
      <ellipse cx="98" cy="150" rx="34" ry="18" fill={paint.belly} opacity="0.9" />
      <Gloss cx={80} cy={110} rx={20} ry={12} paint={paint} />
      <line x1="98" y1="90" x2="98" y2="70" stroke={p.light} strokeWidth="4" strokeLinecap="round" />
      <rect x="91" y="54" width="14" height="14" rx="3.5" fill={p.light}>
        <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
      </rect>
      <Eyes cx={98} cy={126} gap={17} r={11} paint={paint} />
      <path d="M88 149 Q98 157 108 149" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="86" cy="144" rx="5" ry="3.5" fill={p.dark} opacity="0.35" />
      <ellipse cx="110" cy="144" rx="5" ry="3.5" fill={p.dark} opacity="0.35" />
    </g>
  );
}

function LogicStage1({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <path d="M52 162 C42 128 108 142 112 108 C116 76 70 84 66 60" stroke={paint.body} strokeWidth="27" fill="none" strokeLinecap="round" />
      <path d="M52 162 C42 128 108 142 112 108" stroke={p.dark} strokeWidth="27" fill="none" strokeLinecap="round" opacity="0.28" />
      <path d="M54 158 C46 130 104 140 108 110" stroke={p.light} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5" />
      {[
        [80, 140],
        [108, 122],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={p.light} opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur={`${1.8 + i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx="132" cy="66" r="27" fill={paint.body} />
      <Gloss cx={122} cy={54} rx={12} ry={8} paint={paint} />
      <path d="M118 44 L128 28 L136 46 Z" fill={p.light} />
      <Eyes cx={134} cy={62} gap={12} r={9} paint={paint} />
      <path d="M124 80 Q133 86 144 80" stroke="#101426" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function LogicStage2({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <path d="M40 172 C30 130 120 150 124 112 C128 78 60 92 62 58" stroke={paint.body} strokeWidth="33" fill="none" strokeLinecap="round" />
      <path d="M40 172 C30 130 120 150 124 112" stroke={p.dark} strokeWidth="33" fill="none" strokeLinecap="round" opacity="0.32" />
      <path d="M44 166 C36 134 114 148 120 114" stroke={p.light} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.45" />
      {[
        [72, 150],
        [110, 132],
        [118, 96],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 5} y={y - 5} width="10" height="10" rx="2.5" fill={p.light} transform={`rotate(45 ${x} ${y})`}>
          <animate attributeName="opacity" values="0.95;0.3;0.95" dur={`${1.6 + i * 0.5}s`} repeatCount="indefinite" />
        </rect>
      ))}
      <ellipse cx="128" cy="52" rx="43" ry="35" fill={p.dark} opacity="0.9" />
      <ellipse cx="128" cy="52" rx="31" ry="27" fill={paint.body} />
      <Gloss cx={116} cy={40} rx={13} ry={8} paint={paint} />
      <path d="M104 30 L112 10 L120 28 Z" fill={p.light} />
      <path d="M122 26 L130 4 L138 26 Z" fill={p.light} />
      <path d="M140 28 L148 10 L154 30 Z" fill={p.light} />
      <Eyes cx={130} cy={50} gap={14} r={10} paint={paint} />
      <path d="M118 68 Q130 76 142 68" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Craft: the crystal line ---------------- */

function CraftStage0({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <polygon points="100,58 138,122 100,178 62,122" fill={paint.body} />
      <polygon points="100,58 138,122 100,122" fill={p.light} opacity="0.5" />
      <polygon points="100,122 100,178 62,122" fill={p.dark} opacity="0.55" />
      <Gloss cx={88} cy={92} rx={13} ry={22} paint={paint} rotate={24} />
      <Eyes cx={100} cy={116} gap={15} r={10} paint={paint} />
      <path d="M92 139 Q100 146 108 139" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
      <polygon points="46,96 54,108 42,110" fill={p.light}>
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.2s" repeatCount="indefinite" />
      </polygon>
      <polygon points="152,132 160,144 148,146" fill={p.light}>
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.6s" repeatCount="indefinite" />
      </polygon>
    </g>
  );
}

function CraftStage1({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <polygon points="58,170 44,110 74,130" fill={p.dark} />
      <polygon points="142,170 156,104 126,128" fill={p.dark} />
      <polygon points="60,166 48,116 72,132" fill={paint.belly} opacity="0.5" />
      <polygon points="100,42 136,110 100,176 64,110" fill={paint.body} />
      <polygon points="100,42 136,110 100,110" fill={p.light} opacity="0.55" />
      <polygon points="100,110 100,176 64,110" fill={p.dark} opacity="0.5" />
      <Gloss cx={88} cy={78} rx={11} ry={24} paint={paint} rotate={26} />
      <circle cx="100" cy="104" r="7" fill={p.light}>
        <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />
      </circle>
      <Eyes cx={100} cy={84} gap={14} r={9} paint={paint} />
      <path d="M93 100 Q100 105 107 100" stroke="#101426" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function CraftStage2({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <ellipse cx="100" cy="112" rx="72" ry="20" stroke={p.glow} strokeWidth="3" fill="none" />
      <polygon points="28,108 38,118 24,122" fill={p.light}>
        <animate attributeName="opacity" values="1;0.4;1" dur="3s" repeatCount="indefinite" />
      </polygon>
      <polygon points="172,102 180,114 166,116" fill={p.light}>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
      </polygon>
      <polygon points="100,26 142,86 128,170 72,170 58,86" fill={paint.body} />
      <polygon points="100,26 142,86 100,96" fill={p.light} opacity="0.6" />
      <polygon points="100,26 58,86 100,96" fill={p.light} opacity="0.3" />
      <polygon points="72,170 58,86 100,96 100,170" fill={p.dark} opacity="0.5" />
      <Gloss cx={118} cy={70} rx={12} ry={26} paint={paint} rotate={-24} />
      <polygon points="86,30 100,4 114,30" fill={p.light} />
      <circle cx="100" cy="120" r="10" fill={p.light}>
        <animate attributeName="r" values="10;13;10" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <Eyes cx={100} cy={76} gap={16} r={10} paint={paint} />
      <path d="M90 138 Q100 146 110 138" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Influence: the star line ---------------- */

function starPath(cx: number, cy: number, points: number, outer: number, inner: number): string {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  }
  return d + "Z";
}

function InfluenceStage0({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <path d={starPath(100, 120, 4, 54, 23)} fill={paint.body} />
      <path d={starPath(100, 120, 4, 34, 15)} fill={p.light} opacity="0.28" />
      <Gloss cx={86} cy={100} rx={13} ry={9} paint={paint} />
      <Eyes cx={100} cy={114} gap={14} r={10} paint={paint} />
      <circle cx="79" cy="129" r="5.5" fill="#F87171" opacity="0.45" />
      <circle cx="121" cy="129" r="5.5" fill="#F87171" opacity="0.45" />
      <path d="M92 134 Q100 142 108 134" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="146" cy="76" r="4" fill={p.light}>
        <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="56" cy="88" r="3" fill={p.light}>
        <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function InfluenceStage1({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="34"
          x2="100"
          y2="18"
          stroke={p.glow}
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${deg} 100 110)`}
        />
      ))}
      <path d={starPath(100, 110, 5, 64, 29)} fill={paint.body} />
      <path d={starPath(100, 110, 5, 40, 18)} fill={p.light} opacity="0.32" />
      <Gloss cx={84} cy={90} rx={14} ry={10} paint={paint} />
      <Eyes cx={100} cy={102} gap={15} r={10} paint={paint} />
      <path d="M90 124 Q100 133 110 124" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="160" cy="60" r="4" fill={p.light}>
        <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function InfluenceStage2({ paint }: { paint: Paint }) {
  const { p } = paint;
  return (
    <g>
      <circle cx="100" cy="104" r="76" stroke={p.glow} strokeWidth="2" fill="none">
        <animate attributeName="r" values="76;80;76" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="104" r="58" stroke={p.glow} strokeWidth="3" fill="none" opacity="0.7" />
      <path d={starPath(36, 70, 4, 10, 4)} fill={p.light}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite" />
      </path>
      <path d={starPath(166, 84, 4, 8, 3)} fill={p.light}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.8s" repeatCount="indefinite" />
      </path>
      <path d={starPath(150, 168, 4, 7, 3)} fill={p.light}>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </path>
      <path d={starPath(100, 104, 6, 68, 31)} fill={paint.body} />
      <path d={starPath(100, 104, 6, 44, 20)} fill={p.light} opacity="0.35" />
      <circle cx="100" cy="104" r="24" fill={p.light} opacity="0.3" />
      <Gloss cx={82} cy={82} rx={15} ry={10} paint={paint} />
      <Eyes cx={100} cy={98} gap={15} r={10} paint={paint} />
      <path d="M89 118 Q100 128 111 118" stroke="#101426" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Public component ---------------- */

const STAGES: Record<SkillType, (({ paint }: { paint: Paint }) => React.ReactElement)[]> = {
  logic: [LogicStage0, LogicStage1, LogicStage2],
  craft: [CraftStage0, CraftStage1, CraftStage2],
  influence: [InfluenceStage0, InfluenceStage1, InfluenceStage2],
};

export function CreatureSprite({
  line,
  stage,
  size = 200,
  className,
  blend = false,
}: {
  line: Pick<CreatureLine, "type" | "seed" | "spriteUrls">;
  stage: number;
  size?: number;
  className?: string;
  /**
   * Composite onto an already-dark scene (the habitat room, a game field).
   * The generated renders carry a dark studio backdrop; `screen` blending
   * makes those near-black pixels drop out so the creature sits *in* the
   * scene instead of inside a visible square. Leave false on light surfaces,
   * where screen would wash the art out.
   */
  blend?: boolean;
}) {
  const uid = useId().replace(/[:]/g, "");
  const clamped = Math.max(0, Math.min(2, stage));

  // Generated art (Nano Banana pipeline) wins when present; SVG otherwise.
  // The renders carry a baked-in dark studio backdrop, so a radial mask fades
  // the square edges (and any corner artifact) into the page.
  const url = line.spriteUrls?.[clamped];
  if (url) {
    // Crop closer than v1 so less of the render's baked backdrop shows inside
    // the portrait medallion.
    // On a dark scene the mask can be tighter, since screen blending already
    // dissolves the backdrop; on paper it stays softer to avoid clipping.
    const fade = blend
      ? "radial-gradient(circle at 50% 48%, #000 40%, rgba(0,0,0,0.9) 56%, rgba(0,0,0,0.4) 70%, transparent 80%)"
      : "radial-gradient(circle at 50% 50%, #000 46%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.35) 76%, transparent 88%)";
    return (
      <span
        className={className}
        style={{ display: "inline-block", width: size, height: size, position: "relative" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          width={size}
          height={size}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            maskImage: fade,
            WebkitMaskImage: fade,
            mixBlendMode: blend ? "screen" : undefined,
            filter: `drop-shadow(0 6px 22px ${PALETTES[line.type].glow})`,
          }}
        />
      </span>
    );
  }

  const p = PALETTES[line.type];
  const Stage = STAGES[line.type][clamped];
  const hue = line.seed ? ((line.seed % 81) - 40) : 0;

  const paint: Paint = {
    p,
    body: `url(#${uid}-body)`,
    belly: `url(#${uid}-belly)`,
    sheen: `url(#${uid}-sheen)`,
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* 3D body shading: lit core → mid tone → dark rim */}
        <radialGradient id={`${uid}-body`} cx="36%" cy="28%" r="82%">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="38%" stopColor={p.main} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={p.light} stopOpacity="0.9" />
          <stop offset="100%" stopColor={p.main} stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id={`${uid}-sheen`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.main} stopOpacity="0.28" />
          <stop offset="70%" stopColor={p.main} stopOpacity="0.08" />
          <stop offset="100%" stopColor={p.main} stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="7" result="soft" />
          <feGaussianBlur stdDeviation="2.5" result="tight" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="tight" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* living aura */}
      <circle cx="100" cy="112" r="88" fill={`url(#${uid}-aura)`}>
        <animate attributeName="r" values="88;94;88" dur="3.6s" repeatCount="indefinite" />
      </circle>

      <g filter={`url(#${uid}-glow)`}>
        <Stage paint={paint} />
      </g>
    </svg>
  );
}

export function typePalette(type: SkillType): Palette {
  return PALETTES[type];
}

/* ---------------- Work demons ---------------- */

/** Spiky little office gremlin, same shaded rendering as the creatures. */
export function DemonSprite({ seed, size = 160, className }: { seed: number; size?: number; className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const hue = seed % 50; // reds → oranges
  const main = `hsl(${hue} 72% 58%)`;
  const dark = `hsl(${hue} 78% 32%)`;
  const light = `hsl(${hue} 95% 82%)`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-dbody`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={light} />
          <stop offset="40%" stopColor={main} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`${uid}-daura`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={main} stopOpacity="0.25" />
          <stop offset="100%" stopColor={main} stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-dglow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="soft" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="110" r="84" fill={`url(#${uid}-daura)`}>
        <animate attributeName="r" values="84;90;84" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <g filter={`url(#${uid}-dglow)`}>
        <path d="M62 74 L48 40 L78 58 Z" fill={dark} />
        <path d="M138 74 L152 40 L122 58 Z" fill={dark} />
        <path
          d="M100 52 C138 52 156 84 152 118 L162 138 L140 134 L146 156 L122 146 L118 166 L100 152 L82 166 L78 146 L54 156 L60 134 L38 138 L48 118 C44 84 62 52 100 52 Z"
          fill={`url(#${uid}-dbody)`}
        />
        <ellipse cx="100" cy="132" rx="34" ry="17" fill={dark} opacity="0.4" />
        <ellipse cx="84" cy="72" rx="16" ry="9" fill="#ffffff" opacity="0.35" transform="rotate(-16 84 72)" />
        <path d="M70 92 L92 100" stroke={dark} strokeWidth="4" strokeLinecap="round" />
        <path d="M130 92 L108 100" stroke={dark} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="83" cy="106" rx="8" ry="8" fill="#fff">
          <animate attributeName="ry" values="8;8;0.5;8;8" keyTimes="0;0.44;0.5;0.56;1" dur="3.8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="117" cy="106" rx="8" ry="8" fill="#fff">
          <animate attributeName="ry" values="8;8;0.5;8;8" keyTimes="0;0.44;0.5;0.56;1" dur="3.8s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="85" cy="107" r="4.5" fill="#1a0505" />
        <circle cx="115" cy="107" r="4.5" fill="#1a0505" />
        <circle cx="87" cy="105" r="1.6" fill="#fff" />
        <circle cx="117" cy="105" r="1.6" fill="#fff" />
        <path d="M80 128 L88 122 L96 128 L104 122 L112 128 L120 122" stroke={light} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
