// Ambient depth behind every screen. On the light field-guide surface this is
// three slow washes of type-coloured light plus a few drifting pollen motes —
// enough to keep large paper areas alive without competing with content.
// Deterministic layout (no Math.random) so SSR and client agree.

function seq(n: number, salt: number): number[] {
  const out: number[] = [];
  let x = 1234567 + salt;
  for (let i = 0; i < n; i++) {
    x = (x * 48271) % 2147483647;
    out.push((x % 1000) / 1000);
  }
  return out;
}

const MOTE_X = seq(14, 4);
const MOTE_D = seq(14, 5);
const MOTE_S = seq(14, 6);

export function Atmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
      style={{ zIndex: -1 }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: "58vw",
          height: "58vw",
          left: "-14vw",
          top: "-20vw",
          background: "radial-gradient(circle, rgba(14,159,110,0.10) 0%, transparent 66%)",
          filter: "blur(50px)",
          animation: "drift-a 52s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "62vw",
          height: "62vw",
          right: "-20vw",
          top: "4vh",
          background: "radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 66%)",
          filter: "blur(56px)",
          animation: "drift-b 64s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "54vw",
          height: "54vw",
          left: "16vw",
          bottom: "-24vw",
          background: "radial-gradient(circle, rgba(194,118,10,0.11) 0%, transparent 66%)",
          filter: "blur(52px)",
          animation: "drift-c 58s ease-in-out infinite",
        }}
      />

      {/* pollen drifting up through the light */}
      {MOTE_X.map((x, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={
            {
              left: `${x * 100}%`,
              bottom: "-2vh",
              width: 3 + MOTE_S[i] * 4,
              height: 3 + MOTE_S[i] * 4,
              background:
                i % 3 === 0
                  ? "rgba(14,159,110,0.5)"
                  : i % 3 === 1
                    ? "rgba(124,58,237,0.45)"
                    : "rgba(194,118,10,0.55)",
              filter: "blur(2px)",
              "--mote-alpha": 0.18 + MOTE_S[i] * 0.22,
              animation: `mote-rise ${26 + MOTE_D[i] * 30}s linear ${MOTE_D[i] * 24}s infinite`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
