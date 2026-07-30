"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STARTERS } from "@/content/starters";
import { DOMAINS } from "@/content/domains";
import type { CreatureLine } from "@/lib/game/types";
import { adoptCreature, mutateSave } from "@/lib/state/save";
import { beat, setAuto, useAutopilot } from "@/lib/state/autopilot";
import { Dais, TypeBadge, ArcadeButton } from "@/components/ui";
import { typePalette } from "@/lib/sprites/CreatureSprite";
import { proceduralCreatureLine } from "@/lib/ai/creatures";

export default function StarterSelect() {
  const router = useRouter();
  const auto = useAutopilot();
  const [selected, setSelected] = useState<CreatureLine | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [creating, setCreating] = useState(false);

  const adopt = (line: CreatureLine) => {
    mutateSave((s) => adoptCreature(s, line));
    router.push("/home");
  };

  // Tour step: browse the cards, settle on the Logic line, adopt it.
  useEffect(() => {
    if (!auto.active) return;
    setAuto({
      caption: "Pick a starter — or type any real skill and the AI invents an original creature for it.",
    });
    const ts = [
      setTimeout(() => setSelected(STARTERS[2]), beat(1400)),
      setTimeout(() => setSelected(STARTERS[1]), beat(2400)),
      setTimeout(() => setSelected(STARTERS[0]), beat(3400)),
      setTimeout(() => adopt(STARTERS[0]), beat(6000)),
    ];
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto.active]);

  const createCustom = async () => {
    const skill = customSkill.trim();
    if (!skill || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/creature", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skill }),
      });
      if (res.ok) {
        const data = (await res.json()) as { line: CreatureLine };
        setSelected(data.line);
        return;
      }
    } catch {
      // fall through to local generation
    } finally {
      setCreating(false);
    }
    setSelected(proceduralCreatureLine(skill));
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center px-6 py-12">
      <p className="eyebrow">choose your partner</p>
      <h1 className="font-display mt-2 text-3xl sm:text-4xl">Pick a starter</h1>
      <p className="mt-3 max-w-lg text-center text-sm text-dim">
        Your creature levels up when <em>you</em> do. Every battle is a real quiz on the
        skill it embodies.
      </p>

      <div className="mt-10 grid w-full gap-6 sm:grid-cols-3">
        {STARTERS.map((line) => {
          const p = typePalette(line.type);
          const active = selected?.id === line.id;
          return (
            <button
              key={line.id}
              onClick={() => setSelected(line)}
              className="panel flex cursor-pointer flex-col items-center px-4 pb-6 pt-2 text-left transition-transform hover:scale-[1.03]"
              style={active ? { borderColor: p.main, boxShadow: `0 0 24px ${p.glow}` } : undefined}
              aria-pressed={active}
            >
              <Dais line={line} stage={0} size={130} />
              <span className="font-display mt-2 text-lg" style={{ color: p.main }}>
                {line.stageNames[0]}
              </span>
              <span className="mt-1 text-xs text-dim">{line.skillName}</span>
              <span className="mt-3">
                <TypeBadge type={line.type} />
              </span>
            </button>
          );
        })}
      </div>

      {/* custom skill — "AI creates a creature from your real life" (SPEC §5) */}
      <div className="panel mt-8 flex w-full max-w-xl flex-col items-center gap-3 p-6">
        <p className="eyebrow">or create your own skill</p>
        <div className="flex w-full gap-3">
          <input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCustom()}
            placeholder="Kubernetes, watercolor, cold outreach…"
            className="w-full rounded-md border-2 border-panel-border bg-bg px-4 py-3 text-ink placeholder:text-dim/60 focus:border-xp"
            maxLength={60}
            aria-label="Custom skill name"
          />
          <ArcadeButton onClick={createCustom} disabled={!customSkill.trim() || creating}>
            {creating ? "…" : "Forge"}
          </ArcadeButton>
        </div>
        {creating && <p className="text-xs text-dim">Summoning an original creature…</p>}
      </div>

      {/* Skill domains — the type system's roadmap. Any skill works today by
          mapping onto a live type; these are the domains getting their own. */}
      <div className="mt-10 w-full max-w-3xl text-center">
        <p className="eyebrow">skill domains</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-dim">
          Every skill you type maps onto a type. Three are live — more domains get their own
          creatures, arenas and question banks as the series goes on.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {DOMAINS.map((d) => {
            const live = d.type !== null;
            const tint = live ? typePalette(d.type!).main : undefined;
            return (
              <span
                key={d.name}
                title={live ? `${d.name} — ${d.examples}` : `${d.name} — ${d.examples} (coming soon)`}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={
                  live
                    ? { color: tint, background: `color-mix(in srgb, ${tint} 12%, transparent)` }
                    : {
                        color: "var(--text-dim)",
                        background: "transparent",
                        border: "1px dashed var(--panel-border)",
                        opacity: 0.75,
                      }
                }
              >
                {live ? d.name : `${d.name} · soon`}
              </span>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="panel anim-rise mt-8 flex w-full max-w-xl flex-col items-center gap-4 p-6">
          <p className="text-center text-sm leading-relaxed text-dim">
            <span className="font-display text-base text-ink">
              {selected.stageNames[0]} → {selected.stageNames[1]} → {selected.stageNames[2]}
            </span>
            <br />
            <span className="mt-2 inline-block">{selected.lore}</span>
          </p>
          <ArcadeButton
            onClick={() => adopt(selected)}
            color={typePalette(selected.type).main}
            autoFocus
          >
            Choose {selected.stageNames[0]}
          </ArcadeButton>
        </div>
      )}
    </main>
  );
}
