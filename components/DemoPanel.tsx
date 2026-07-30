"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_MODE, FILM_MODE } from "@/lib/game/config";
import { applyXp, xpToNext } from "@/lib/game/xp";
import { useSave } from "@/lib/state/save";
import { setAuto, startAutopilot, useAutopilot } from "@/lib/state/autopilot";

// Demo Mode testing console (SPEC §10): instantly grant XP, force level-ups,
// and unlock everything so the whole game can be exercised without grinding.
// Renders nothing outside Demo Mode.

export function DemoPanel() {
  const { save, update, reset } = useSave();
  const router = useRouter();
  const auto = useAutopilot();
  const [open, setOpen] = useState(false);

  // Film Mode hides debug UI (SPEC §10), and the auto-demo must stay clean.
  if (!DEMO_MODE || FILM_MODE || auto.active || !save) return null;

  const grantXp = (amount: number) => {
    update((s) => {
      if (!s.creature) return s;
      const r = applyXp(s.creature.level, s.creature.xp, amount);
      return { ...s, creature: { ...s.creature, level: r.level, xp: r.xp, stage: r.stage } };
    });
  };

  const levelUp = () => {
    if (save.creature) grantXp(xpToNext(save.creature.level) - save.creature.xp);
  };

  const unlockAll = () => {
    update((s) => ({
      ...s,
      flags: { ...s.flags, allArenas: true, allDecor: true },
      arenaWildBeaten: [1, 2, 3, 4, 5, 6, 7, 8],
    }));
  };

  const maxMood = () => {
    update((s) => ({
      ...s,
      habitat: { ...s.habitat, mood: 100, lastCare: new Date().toISOString() },
    }));
  };

  const btn =
    "cursor-pointer rounded-sm border-2 border-panel-border px-2.5 py-1.5 text-left text-[11px] hover:border-xp hover:text-ink";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="panel flex w-48 flex-col gap-1.5 p-3">
          <p className="eyebrow mb-1">demo tools</p>
          {([false, true] as const).map((full) => (
            <button
              key={String(full)}
              className={btn}
              onClick={() => {
                reset();
                startAutopilot(full);
                setAuto({ caption: "VIVARIA — a creature that levels up when you actually do." });
                router.push("/");
              }}
            >
              {full ? "▶▶ Full tour · 70s" : "▶▶ Quick demo · 50s"}
            </button>
          ))}
          <button className={btn} onClick={() => grantXp(60)}>+60 XP</button>
          <button className={btn} onClick={levelUp}>Level up now</button>
          <button className={btn} onClick={unlockAll}>Unlock arenas + decor</button>
          <button className={btn} onClick={maxMood}>Max mood</button>
          <button
            className={`${btn} text-hp/90 hover:border-hp`}
            onClick={() => {
              reset();
              router.push("/");
            }}
          >
            Reset save
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="font-display cursor-pointer rounded-md border-2 border-panel-border bg-panel px-3 py-2 text-[11px] uppercase tracking-widest text-dim hover:border-xp hover:text-ink"
        aria-expanded={open}
      >
        {open ? "× demo" : "▚ demo"}
      </button>
    </div>
  );
}
