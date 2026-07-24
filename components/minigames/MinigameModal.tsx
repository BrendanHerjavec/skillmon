"use client";

import { useEffect, useState } from "react";
import type { CreatureLine } from "@/lib/game/types";
import type { SkillType } from "@/lib/game/config";
import { MINIGAMES, moodForScore, type MinigameId } from "@/lib/game/minigames";
import { careForCreature, useSave } from "@/lib/state/save";
import { BitCatch } from "./BitCatch";
import { ShardStack } from "./ShardStack";
import { Echo } from "./Echo";

// Habitat playtime: three tiny type-themed games. Finishing any round pays
// mood (moodForScore) and records a best score. The creature's own type's
// game is front and center, but all three are open.

const HOME_GAME: Record<SkillType, MinigameId> = {
  logic: "bitcatch",
  craft: "stack",
  influence: "echo",
};

export function MinigameModal({
  line,
  onClose,
  onReward,
  auto = false,
}: {
  line: CreatureLine;
  onClose: () => void;
  onReward: () => void; // habitat celebration hook (trick animation)
  /** Auto-demo: the game plays itself so the tour needs no input. */
  auto?: boolean;
}) {
  const { save, update } = useSave();
  const [game, setGame] = useState<MinigameId>(HOME_GAME[line.type]);
  const [lastReward, setLastReward] = useState<{ score: number; mood: number; best: boolean } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const finish = (score: number) => {
    const mood = moodForScore(game, score);
    const prevBest = save?.habitat.bestScores?.[game] ?? 0;
    const best = score > prevBest;
    update((s) =>
      careForCreature(
        {
          ...s,
          habitat: {
            ...s.habitat,
            bestScores: { ...s.habitat.bestScores, [game]: Math.max(prevBest, score) },
          },
        },
        mood,
      ),
    );
    setLastReward({ score, mood, best });
    if (score > 0) onReward();
  };

  const meta = MINIGAMES.find((m) => m.id === game)!;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-4 backdrop-blur-sm">
      <div className="panel anim-rise w-full max-w-lg p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">playtime</p>
          <button onClick={onClose} className="eyebrow cursor-pointer hover:text-ink" aria-label="Close">
            × close
          </button>
        </div>

        {/* game tabs */}
        <div className="mt-3 flex gap-2">
          {MINIGAMES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setGame(m.id);
                setLastReward(null);
              }}
              className="eyebrow cursor-pointer rounded-sm border-2 px-2.5 py-1.5"
              style={
                game === m.id
                  ? { borderColor: "var(--xp)", color: "var(--text)" }
                  : { borderColor: "var(--panel-border)" }
              }
            >
              {m.name}
              {m.id === HOME_GAME[line.type] ? " ★" : ""}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-dim">
          {meta.tagline} · best: {save?.habitat.bestScores?.[game] ?? 0}
          {lastReward && (
            <span className="ml-2" style={{ color: "var(--logic)" }}>
              +{lastReward.mood} mood{lastReward.best ? " · new best!" : ""}
            </span>
          )}
        </p>

        <div className="mt-4">
          {game === "bitcatch" && <BitCatch line={line} onFinish={finish} auto={auto} />}
          {game === "stack" && <ShardStack onFinish={finish} />}
          {game === "echo" && <Echo onFinish={finish} />}
        </div>
      </div>
    </div>
  );
}
