"use client";

import { useId } from "react";

// Habitat props, v2. These sit inside a painted, lit vivarium alongside a
// glossy 3D creature, so flat fills read as stickers. Every prop now has a
// gradient body, a specular highlight, a warm/cool light side, and a grounding
// contact shadow — the same shading language as lib/sprites/CreatureSprite.
//
// Gradient ids are scoped per instance with useId so several props can share
// a page without colliding.

interface Ink {
  /** unique prefix for gradient/filter ids */
  u: string;
}

const GLASS = "#f3ede4";
const SHADOW = "rgba(0,0,0,0.45)";

/** Soft ellipse under a prop so it sits on the floor instead of floating. */
function Contact({ cx = 40, cy = 71, rx = 22, ry = 5 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={SHADOW} opacity="0.5" style={{ filter: "blur(2px)" }} />;
}

function Fern({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-pot`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c2703f" />
          <stop offset="55%" stopColor="#9a5330" />
          <stop offset="100%" stopColor="#5d3018" />
        </linearGradient>
        <linearGradient id={`${u}-leaf`} x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0%" stopColor="#0d7a52" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>
      <Contact rx={18} />
      <path
        d="M40 60 C40 38 22 42 17 22 C35 26 40 41 40 35 C40 22 31 17 33 4 C46 13 44 32 42 42 C49 29 51 24 64 20 C59 40 46 42 40 60 Z"
        fill={`url(#${u}-leaf)`}
      />
      <path d="M40 60 C40 44 32 34 26 26" stroke="#0b5f40" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M28 58 L52 58 L48 74 L32 74 Z" fill={`url(#${u}-pot)`} />
      <ellipse cx="40" cy="58" rx="12" ry="3.2" fill="#3c1f0f" />
      <path d="M31 60 L33 72" stroke={GLASS} strokeWidth="1.6" opacity="0.28" strokeLinecap="round" />
    </g>
  );
}

function Terminal({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-case`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3c4460" />
          <stop offset="60%" stopColor="#232a3f" />
          <stop offset="100%" stopColor="#141926" />
        </linearGradient>
        <radialGradient id={`${u}-screen`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1d5c47" />
          <stop offset="100%" stopColor="#07130f" />
        </radialGradient>
      </defs>
      <Contact rx={20} cy={73} />
      <rect x="13" y="20" width="54" height="40" rx="5" fill={`url(#${u}-case)`} />
      <rect x="18" y="25" width="44" height="29" rx="3" fill={`url(#${u}-screen)`} />
      <path d="M23 32 L30 38 L23 44" stroke="#34d399" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="34" y1="44" x2="46" y2="44" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.1;1" dur="1.3s" repeatCount="indefinite" />
      </line>
      {/* screen sheen */}
      <path d="M18 25 L34 25 L20 54 L18 54 Z" fill={GLASS} opacity="0.07" />
      <rect x="32" y="60" width="16" height="6" rx="2" fill="#2a3145" />
      <rect x="22" y="66" width="36" height="6" rx="3" fill={`url(#${u}-case)`} />
      <rect x="15" y="21" width="50" height="2" rx="1" fill={GLASS} opacity="0.14" />
    </g>
  );
}

function Lamp({ u }: Ink) {
  return (
    <g>
      <defs>
        <radialGradient id={`${u}-bulb`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id={`${u}-stem`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b8f9e" />
          <stop offset="45%" stopColor="#cfd4e0" />
          <stop offset="100%" stopColor="#5b606e" />
        </linearGradient>
      </defs>
      <Contact rx={17} cy={74} />
      <ellipse cx="40" cy="30" rx="21" ry="22" fill="#fbbf24" opacity="0.16">
        <animate attributeName="opacity" values="0.16;0.34;0.16" dur="2.8s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="40" cy="30" r="11" fill={`url(#${u}-bulb)`} />
      <circle cx="36" cy="26" r="3.2" fill="#fffdf5" opacity="0.85" />
      <rect x="37.5" y="40" width="5" height="28" rx="2" fill={`url(#${u}-stem)`} />
      <path d="M26 70 Q40 64 54 70 L54 74 Q40 78 26 74 Z" fill="#2b3040" />
      <path d="M28 71 Q40 66 52 71" stroke={GLASS} strokeWidth="1.4" fill="none" opacity="0.25" />
    </g>
  );
}

function Arcade({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-cab`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#5a3f8f" />
          <stop offset="45%" stopColor="#3b2765" />
          <stop offset="100%" stopColor="#1f1538" />
        </linearGradient>
        <radialGradient id={`${u}-crt`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#2b3f6b" />
          <stop offset="100%" stopColor="#080c18" />
        </radialGradient>
      </defs>
      <Contact rx={21} cy={75} />
      <path d="M17 12 Q17 8 21 8 L59 8 Q63 8 63 12 L63 72 L17 72 Z" fill={`url(#${u}-cab)`} />
      <rect x="23" y="15" width="34" height="24" rx="3" fill={`url(#${u}-crt)`} />
      <circle cx="33" cy="27" r="3.6" fill="#f87171">
        <animate attributeName="cx" values="33;47;33" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <rect x="27" y="33" width="26" height="2.5" rx="1.2" fill="#34d399" opacity="0.85" />
      <path d="M23 15 L36 15 L26 39 L23 39 Z" fill={GLASS} opacity="0.08" />
      <rect x="23" y="44" width="34" height="12" rx="3" fill="#241a42" />
      <circle cx="31" cy="50" r="4" fill="#c084fc" />
      <circle cx="30" cy="48.6" r="1.4" fill={GLASS} opacity="0.6" />
      <circle cx="41" cy="50" r="3.2" fill="#f87171" />
      <circle cx="50" cy="50" r="3.2" fill="#34d399" />
      <rect x="23" y="60" width="34" height="5" rx="2" fill="#150f28" />
      <rect x="19" y="9" width="42" height="2" rx="1" fill={GLASS} opacity="0.16" />
    </g>
  );
}

function BookStack({ u }: Ink) {
  const books = [
    { y: 56, w: 46, x: 17, a: "#7c3aed", b: "#4c1d95" },
    { y: 46, w: 40, x: 20, a: "#2563eb", b: "#1e3a8a" },
    { y: 36, w: 34, x: 23, a: "#0d9488", b: "#134e4a" },
    { y: 26, w: 26, x: 27, a: "#c2760a", b: "#78350f" },
  ];
  return (
    <g>
      <defs>
        {books.map((bk, i) => (
          <linearGradient key={i} id={`${u}-bk${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bk.a} />
            <stop offset="100%" stopColor={bk.b} />
          </linearGradient>
        ))}
      </defs>
      <Contact rx={22} cy={70} />
      {books.map((bk, i) => (
        <g key={i}>
          <rect x={bk.x} y={bk.y} width={bk.w} height="10" rx="2" fill={`url(#${u}-bk${i})`} />
          <rect x={bk.x} y={bk.y} width={bk.w} height="2.4" rx="1.2" fill={GLASS} opacity="0.22" />
          <rect x={bk.x + 3} y={bk.y + 4} width={bk.w - 6} height="1.4" rx="0.7" fill="#0b0b14" opacity="0.35" />
        </g>
      ))}
    </g>
  );
}

function Plush({ u }: Ink) {
  return (
    <g>
      <defs>
        <radialGradient id={`${u}-body`} cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="45%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
      <Contact rx={19} cy={70} />
      <path d="M30 33 L23 19 L35 27 Z" fill="#991b1b" />
      <path d="M50 33 L57 19 L45 27 Z" fill="#991b1b" />
      <ellipse cx="40" cy="49" rx="21" ry="19" fill={`url(#${u}-body)`} />
      <ellipse cx="40" cy="56" rx="12" ry="8" fill="#7f1d1d" opacity="0.4" />
      <ellipse cx="31" cy="40" rx="7" ry="4.5" fill={GLASS} opacity="0.28" transform="rotate(-20 31 40)" />
      <circle cx="33" cy="46" r="4.4" fill="#fff" />
      <circle cx="47" cy="46" r="4.4" fill="#fff" />
      <circle cx="34" cy="47" r="2.2" fill="#160404" />
      <circle cx="46" cy="47" r="2.2" fill="#160404" />
      <circle cx="34.8" cy="46" r="0.8" fill="#fff" />
      <path d="M33 58 Q40 63 47 58" stroke="#450a0a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M53 63 L60 70" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="round" />
    </g>
  );
}

function Trophy({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <Contact rx={17} cy={71} />
      <ellipse cx="40" cy="26" rx="24" ry="20" fill="#fbbf24" opacity="0.12" />
      <path d="M28 14 L52 14 L50 38 C48 49 32 49 30 38 Z" fill={`url(#${u}-gold)`} />
      <path d="M28 18 C17 18 17 33 28 35" stroke="#d69b1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M52 18 C63 18 63 33 52 35" stroke="#d69b1a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M31 16 L34 38" stroke={GLASS} strokeWidth="2.6" opacity="0.4" strokeLinecap="round" />
      <rect x="36" y="47" width="8" height="10" fill="#a16207" />
      <path d="M28 57 L52 57 L54 66 L26 66 Z" fill="#3f2d1a" />
      <rect x="28" y="58" width="24" height="2" rx="1" fill={GLASS} opacity="0.18" />
      <path d="M40 22 L42.4 28 L48.6 28 L43.6 31.8 L45.6 38 L40 34.2 L34.4 38 L36.4 31.8 L31.4 28 L37.6 28 Z" fill="#fffbeb" opacity="0.9" />
    </g>
  );
}

function Banner({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-cloth`} x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <rect x="14" y="10" width="52" height="5" rx="2.5" fill="#6b7280" />
      <rect x="14" y="10" width="52" height="1.6" rx="0.8" fill={GLASS} opacity="0.3" />
      <path d="M21 15 L59 15 L59 60 L40 50 L21 60 Z" fill={`url(#${u}-cloth)`} />
      <path d="M21 15 L32 15 L32 55.5 L21 60 Z" fill={GLASS} opacity="0.1" />
      <path d="M40 24 L42.8 31 L50 31 L44.2 35.4 L46.4 42.6 L40 38.2 L33.6 42.6 L35.8 35.4 L30 31 L37.2 31 Z" fill="#f5f3ff" />
    </g>
  );
}

function Fountain({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-basin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <radialGradient id={`${u}-water`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
      </defs>
      <Contact rx={25} cy={73} />
      <ellipse cx="40" cy="64" rx="25" ry="9.5" fill={`url(#${u}-basin)`} />
      <ellipse cx="40" cy="61.5" rx="19" ry="6.5" fill={`url(#${u}-water)`} opacity="0.75" />
      <ellipse cx="34" cy="60" rx="5" ry="1.8" fill={GLASS} opacity="0.35" />
      <rect x="37" y="38" width="6" height="22" rx="2" fill="#374151" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M40 38 C ${27 + i * 13} 23, ${27 + i * 13} 47, ${29 + i * 11} 57`}
          stroke="#93c5fd"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        >
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
      <circle cx="40" cy="35" r="5" fill="#dbeafe" opacity="0.9">
        <animate attributeName="r" values="5;6.2;5" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function Crystal({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-c1`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="45%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <Contact rx={20} cy={72} />
      <ellipse cx="40" cy="66" rx="24" ry="8" fill="#c084fc" opacity="0.18">
        <animate attributeName="opacity" values="0.18;0.34;0.18" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <polygon points="29,70 21,42 34,51" fill="#6d28d9" />
      <polygon points="53,70 61,38 46,49" fill="#6d28d9" />
      <polygon points="53,70 61,38 55,52" fill="#8b5cf6" />
      <polygon points="40,70 27,29 40,15 53,31" fill={`url(#${u}-c1)`} />
      <polygon points="40,70 40,15 53,31" fill="#4c1d95" opacity="0.45" />
      <polygon points="40,15 27,29 40,34" fill={GLASS} opacity="0.35" />
      <circle cx="38" cy="44" r="3" fill="#fff">
        <animate attributeName="opacity" values="1;0.35;1" dur="2.1s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function StarMobile({ u }: Ink) {
  const star = (cx: number, cy: number, r: number, fill: string) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.44;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
    return <polygon points={pts.join(" ")} fill={fill} />;
  };
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-bar`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="50%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
      </defs>
      <line x1="40" y1="5" x2="40" y2="17" stroke="#9ca3af" strokeWidth="1.6" />
      <rect x="18" y="16" width="44" height="2.6" rx="1.3" fill={`url(#${u}-bar)`} />
      <line x1="24" y1="18" x2="24" y2="34" stroke="#9ca3af" strokeWidth="1.2" />
      <line x1="56" y1="18" x2="56" y2="29" stroke="#9ca3af" strokeWidth="1.2" />
      <line x1="40" y1="18" x2="40" y2="47" stroke="#9ca3af" strokeWidth="1.2" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-8 24 44;8 24 44;-8 24 44" dur="4s" repeatCount="indefinite" />
        {star(24, 44, 10, "#fbbf24")}
        <circle cx="21" cy="41" r="1.8" fill="#fffbeb" opacity="0.8" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="6 56 36;-6 56 36;6 56 36" dur="3.4s" repeatCount="indefinite" />
        {star(56, 36, 8, "#c084fc")}
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-5 40 57;5 40 57;-5 40 57" dur="5s" repeatCount="indefinite" />
        {star(40, 57, 12, "#34d399")}
        <circle cx="36" cy="53" r="2" fill="#ecfdf5" opacity="0.75" />
      </g>
    </g>
  );
}

function Poster({ u }: Ink) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-paper`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#2b2440" />
          <stop offset="100%" stopColor="#141024" />
        </linearGradient>
        <radialGradient id={`${u}-orb`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f5d0fe" />
          <stop offset="60%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6b21a8" />
        </radialGradient>
      </defs>
      <rect x="18" y="12" width="44" height="56" rx="4" fill={`url(#${u}-paper)`} />
      <rect x="18" y="12" width="44" height="56" rx="4" fill="none" stroke="#c084fc" strokeWidth="1.6" opacity="0.55" />
      <circle cx="40" cy="33" r="10" fill={`url(#${u}-orb)`}>
        <animate attributeName="opacity" values="1;0.55;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="36.5" cy="29.5" r="2.6" fill="#fff" opacity="0.7" />
      <path d="M26 54 L35 45 L42 51 L54 39" stroke="#34d399" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="26" y1="61" x2="46" y2="61" stroke="#8b8299" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 12 L30 12 L22 68 L18 68 Z" fill={GLASS} opacity="0.05" />
    </g>
  );
}

const SPRITES: Record<string, (p: Ink) => React.ReactElement> = {
  fern: Fern,
  terminal: Terminal,
  lamp: Lamp,
  arcade: Arcade,
  bookstack: BookStack,
  plush: Plush,
  trophy: Trophy,
  banner: Banner,
  fountain: Fountain,
  crystal: Crystal,
  mobile: StarMobile,
  poster: Poster,
};

export function DecorSprite({ id, size = 80, className }: { id: string; size?: number; className?: string }) {
  const u = useId().replace(/:/g, "");
  const Sprite = SPRITES[id];
  if (!Sprite) return null;
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} aria-hidden="true">
      <Sprite u={u} />
    </svg>
  );
}
