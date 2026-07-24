// Procedural SVG habitat props, one per decor item id (content/decor.ts).
// Same night-arcade language as the creatures: glow, chunky shapes, charm.

// Props live inside the dark habitat vivarium, so these stay bright and
// luminous rather than following the light page palette.
const P = {
  navy: "#0e0c14",
  panel: "#221f2e",
  border: "#3a3550",
  ink: "#f3ede4",
  dim: "#9d93aa",
  logic: "#34d399",
  craft: "#c084fc",
  influence: "#fbbf24",
  hp: "#f87171",
  xp: "#fbbf24",
};

function Fern() {
  return (
    <g>
      <path d="M28 66 L52 66 L48 84 L32 84 Z" fill="#8a5a3b" />
      <path d="M40 62 C40 40 24 44 20 26 C36 30 40 44 40 38 C40 26 32 22 34 8 C46 16 44 34 42 44 C48 32 50 28 62 24 C58 42 46 44 40 62 Z" fill={P.logic} />
    </g>
  );
}

function Terminal() {
  return (
    <g>
      <rect x="14" y="22" width="52" height="38" rx="4" fill={P.panel} stroke={P.border} strokeWidth="3" />
      <rect x="20" y="28" width="40" height="26" rx="2" fill={P.navy} />
      <path d="M24 34 L30 39 L24 44" stroke={P.logic} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="34" y1="44" x2="44" y2="44" stroke={P.logic} strokeWidth="2.5" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
      </line>
      <rect x="30" y="60" width="20" height="6" rx="2" fill={P.border} />
      <rect x="22" y="66" width="36" height="6" rx="2" fill={P.border} />
    </g>
  );
}

function Lamp() {
  return (
    <g>
      <ellipse cx="40" cy="30" rx="16" ry="18" fill={P.influence} opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2.5s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="40" cy="30" r="10" fill={P.influence} />
      <rect x="37" y="40" width="6" height="28" rx="2" fill={P.border} />
      <rect x="26" y="68" width="28" height="7" rx="3" fill={P.panel} stroke={P.border} strokeWidth="2" />
    </g>
  );
}

function Arcade() {
  return (
    <g>
      <path d="M18 14 L62 14 L62 76 L18 76 Z" fill={P.panel} stroke={P.border} strokeWidth="3" />
      <rect x="24" y="20" width="32" height="22" rx="2" fill={P.navy} />
      <circle cx="34" cy="30" r="4" fill={P.hp}>
        <animate attributeName="cx" values="34;46;34" dur="2s" repeatCount="indefinite" />
      </circle>
      <rect x="24" y="48" width="32" height="10" rx="2" fill={P.border} />
      <circle cx="32" cy="53" r="3.5" fill={P.craft} />
      <circle cx="42" cy="53" r="3" fill={P.hp} />
      <circle cx="50" cy="53" r="3" fill={P.logic} />
      <rect x="24" y="62" width="32" height="4" rx="2" fill={P.navy} />
    </g>
  );
}

function BookStack() {
  return (
    <g>
      <rect x="18" y="58" width="44" height="10" rx="2" fill={P.craft} />
      <rect x="22" y="48" width="38" height="10" rx="2" fill={P.xp} />
      <rect x="26" y="38" width="30" height="10" rx="2" fill={P.logic} />
      <rect x="30" y="28" width="22" height="10" rx="2" fill={P.influence} />
      <line x1="26" y1="63" x2="54" y2="63" stroke={P.navy} strokeWidth="1.5" />
      <line x1="30" y1="53" x2="52" y2="53" stroke={P.navy} strokeWidth="1.5" />
    </g>
  );
}

function Plush() {
  return (
    <g>
      <path d="M30 34 L24 22 L34 28 Z" fill="#b91c1c" />
      <path d="M50 34 L56 22 L46 28 Z" fill="#b91c1c" />
      <ellipse cx="40" cy="50" rx="20" ry="18" fill={P.hp} />
      <ellipse cx="40" cy="56" rx="12" ry="8" fill="#b91c1c" opacity="0.5" />
      <circle cx="33" cy="46" r="4" fill="#fff" />
      <circle cx="47" cy="46" r="4" fill="#fff" />
      <circle cx="34" cy="47" r="2" fill={P.navy} />
      <circle cx="46" cy="47" r="2" fill={P.navy} />
      <path d="M34 58 Q40 62 46 58" stroke={P.navy} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M52 64 L58 70" stroke={P.hp} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Trophy() {
  return (
    <g>
      <path d="M28 18 L52 18 L50 40 C48 50 32 50 30 40 Z" fill={P.influence} />
      <path d="M28 22 C18 22 18 34 28 36" stroke={P.influence} strokeWidth="4" fill="none" />
      <path d="M52 22 C62 22 62 34 52 36" stroke={P.influence} strokeWidth="4" fill="none" />
      <rect x="36" y="48" width="8" height="10" fill="#b8860b" />
      <rect x="28" y="58" width="24" height="8" rx="2" fill={P.panel} stroke={P.border} strokeWidth="2" />
      <path d="M40 24 L42 29 L47 29 L43 32 L45 37 L40 34 L35 37 L37 32 L33 29 L38 29 Z" fill="#fff8dc" />
    </g>
  );
}

function Banner() {
  return (
    <g>
      <rect x="16" y="12" width="48" height="6" rx="2" fill={P.border} />
      <path d="M22 18 L58 18 L58 60 L40 50 L22 60 Z" fill={P.craft} />
      <path d="M40 26 L42.5 32 L49 32 L44 36 L46 42 L40 38.5 L34 42 L36 36 L31 32 L37.5 32 Z" fill="#fff" />
    </g>
  );
}

function Fountain() {
  return (
    <g>
      <ellipse cx="40" cy="64" rx="24" ry="9" fill={P.panel} stroke={P.border} strokeWidth="2.5" />
      <ellipse cx="40" cy="61" rx="17" ry="5.5" fill={P.xp} opacity="0.5" />
      <rect x="37" y="38" width="6" height="22" fill={P.border} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M40 38 C ${28 + i * 12} 24, ${28 + i * 12} 46, ${30 + i * 10} 56`}
          stroke={P.xp}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        >
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${1.4 + i * 0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
      <circle cx="40" cy="36" r="4" fill={P.xp} />
    </g>
  );
}

function Crystal() {
  return (
    <g>
      <polygon points="30,70 22,44 34,52" fill="#7c3aed" />
      <polygon points="52,70 60,40 46,50" fill="#7c3aed" />
      <polygon points="40,70 28,30 40,18 52,32" fill={P.craft} />
      <polygon points="40,70 40,18 52,32" fill="#e9d5ff" opacity="0.5" />
      <circle cx="40" cy="44" r="3" fill="#fff">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function StarMobile() {
  return (
    <g>
      <line x1="40" y1="8" x2="40" y2="18" stroke={P.dim} strokeWidth="2" />
      <line x1="20" y1="22" x2="60" y2="18" stroke={P.dim} strokeWidth="2" />
      <line x1="24" y1="22" x2="24" y2="36" stroke={P.dim} strokeWidth="1.5" />
      <line x1="56" y1="20" x2="56" y2="30" stroke={P.dim} strokeWidth="1.5" />
      <line x1="40" y1="20" x2="40" y2="48" stroke={P.dim} strokeWidth="1.5" />
      <path d="M24 36 L26.5 42 L33 42 L28 46 L30 52 L24 48.5 L18 52 L20 46 L15 42 L21.5 42 Z" fill={P.influence}>
        <animateTransform attributeName="transform" type="rotate" values="-8 24 44;8 24 44;-8 24 44" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M56 30 L58 35 L63 35 L59 38 L61 43 L56 40 L51 43 L53 38 L49 35 L54 35 Z" fill={P.craft}>
        <animateTransform attributeName="transform" type="rotate" values="6 56 36;-6 56 36;6 56 36" dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d="M40 48 L43 55 L50 55 L44.5 60 L47 67 L40 63 L33 67 L35.5 60 L30 55 L37 55 Z" fill={P.logic}>
        <animateTransform attributeName="transform" type="rotate" values="-5 40 57;5 40 57;-5 40 57" dur="5s" repeatCount="indefinite" />
      </path>
    </g>
  );
}

function Poster() {
  return (
    <g>
      <rect x="20" y="14" width="40" height="52" rx="3" fill={P.panel} stroke={P.craft} strokeWidth="2.5" />
      <rect x="25" y="19" width="30" height="42" rx="2" fill={P.navy} />
      <circle cx="40" cy="34" r="8" fill={P.craft} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite" />
      </circle>
      <path d="M28 52 L36 44 L42 49 L52 40" stroke={P.logic} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="57" x2="46" y2="57" stroke={P.dim} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

const SPRITES: Record<string, () => React.ReactElement> = {
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
  const Sprite = SPRITES[id];
  if (!Sprite) return null;
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} aria-hidden="true">
      <Sprite />
    </svg>
  );
}
