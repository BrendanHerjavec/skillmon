"use client";

import Link from "next/link";
import { STARTERS } from "@/content/starters";
import type { CreatureLine } from "@/lib/game/types";
import { useEffect } from "react";
import { useSave } from "@/lib/state/save";
import { beat, setAuto, stopAutopilot, useAutopilot } from "@/lib/state/autopilot";
import { TypeBadge } from "@/components/ui";
import { CreatureSprite, typePalette } from "@/lib/sprites/CreatureSprite";

// Week-1 Dex: every known line, with undiscovered stages as silhouettes.

export default function DexPage() {
  const { save, loaded } = useSave();
  const auto = useAutopilot();

  // Final tour beat, then hand control back.
  useEffect(() => {
    if (!auto.active) return;
    setAuto({
      caption: "That's the loop: learn something real, prove it, and your creature grows with you.",
    });
    const t = setTimeout(stopAutopilot, beat(7000));
    return () => clearTimeout(t);
  }, [auto.active]);

  if (!loaded) return <main className="min-h-dvh" />;

  const custom = (save?.discoveredLines ?? []).filter(
    (l) => !STARTERS.some((s) => s.id === l.id),
  );
  const lines: CreatureLine[] = [...STARTERS, ...custom];
  const active = save?.creature;

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="eyebrow">collection</p>
          <h1 className="font-display mt-1 text-3xl">Dex</h1>
        </div>
        <Link href="/home" className="eyebrow underline-offset-4 hover:underline">
          ← Home
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lines.map((line) => {
          const p = typePalette(line.type);
          const isActive = active?.line.id === line.id;
          const knownStage = isActive ? active.stage : line.id === active?.line.id ? active.stage : isDiscovered(line, save?.discoveredLines) ? 0 : -1;
          return (
            <div key={line.id} className="panel p-5" style={isActive ? { borderColor: p.main } : undefined}>
              <div className="flex items-center justify-between">
                <span className="font-display text-sm" style={{ color: p.main }}>
                  {line.skillName}
                </span>
                <TypeBadge type={line.type} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {line.stageNames.map((name, stage) => {
                  const seen = knownStage >= stage;
                  const box = 74;
                  return (
                    <div key={stage} className="flex flex-col items-center gap-1.5">
                      {seen ? (
                        <div
                          className="plate grid place-items-center"
                          style={{ width: box, height: box }}
                        >
                          <CreatureSprite line={line} stage={stage} size={box - 4} />
                        </div>
                      ) : (
                        // Undiscovered: a clean sealed slot beats a blurred sprite.
                        <div
                          className="grid place-items-center rounded-2xl"
                          style={{
                            width: box,
                            height: box,
                            background: "var(--bg-deep)",
                            border: "1px dashed var(--panel-border)",
                          }}
                        >
                          <span className="font-display text-xl text-dim/70">?</span>
                        </div>
                      )}
                      <span className="text-center text-[10px] leading-tight text-dim">
                        {seen ? name : "???"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-dim">{line.lore}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function isDiscovered(line: CreatureLine, discovered?: CreatureLine[]): boolean {
  return discovered?.some((d) => d.id === line.id) ?? false;
}
