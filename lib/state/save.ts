"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CreatureLine, MissedQuestion, Question, SaveData } from "@/lib/game/types";
import { stageForLevel } from "@/lib/game/xp";
import { STARTERS } from "@/content/starters";

// Demo Mode persistence: a seeded local account in localStorage (SPEC §10).
// The shape mirrors the Supabase schema so swapping in real persistence later
// is a storage change, not a rewrite.

const KEY = "skillmon-save-v1";

export function emptySave(): SaveData {
  return {
    version: 1,
    creature: null,
    badges: [],
    arenaWildBeaten: [],
    missed: [],
    discoveredLines: [],
    habitat: {
      placed: [{ itemId: "fern", spot: 1 }],
      mood: 60,
      lastCare: new Date().toISOString(),
      bestScores: {},
    },
    flags: {},
    createdAt: new Date().toISOString(),
  };
}

/**
 * Saves store a snapshot of the creature line, so content updates (new
 * generated sprite art, tweaked lore) would never reach an existing save.
 * Re-merge the current definition for built-in starters on every load;
 * custom creatures keep whatever they were created with.
 */
function rehydrate(line: CreatureLine): CreatureLine {
  const current = STARTERS.find((s) => s.id === line.id);
  return current ? { ...line, ...current } : line;
}

export function loadSave(): SaveData {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== 1) return emptySave();
    // Deep-merge one level so saves written before a field existed pick up
    // its default (e.g. habitat.bestScores).
    const empty = emptySave();
    return {
      ...empty,
      ...data,
      creature: data.creature ? { ...data.creature, line: rehydrate(data.creature.line) } : null,
      discoveredLines: (data.discoveredLines ?? []).map(rehydrate),
      habitat: { ...empty.habitat, ...data.habitat },
      flags: { ...empty.flags, ...data.flags },
    };
  } catch {
    return emptySave();
  }
}

export function persistSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetSave(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function adoptCreature(save: SaveData, line: CreatureLine): SaveData {
  return {
    ...save,
    creature: { line, level: 1, xp: 0, stage: stageForLevel(1), wins: 0, losses: 0 },
    discoveredLines: save.discoveredLines.some((l) => l.id === line.id)
      ? save.discoveredLines
      : [...save.discoveredLines, line],
  };
}

export function recordMiss(save: SaveData, skillName: string, question: Question): SaveData {
  const existing = save.missed.find((m) => m.question.q === question.q);
  const missed: MissedQuestion[] = existing
    ? save.missed.map((m) =>
        m.question.q === question.q
          ? { ...m, timesMissed: m.timesMissed + 1, lastSeen: new Date().toISOString() }
          : m,
      )
    : [...save.missed, { skillName, question, timesMissed: 1, lastSeen: new Date().toISOString() }];
  return { ...save, missed };
}

/* ---------------- habitat care ---------------- */

export function clampMood(mood: number): number {
  return Math.max(0, Math.min(100, Math.round(mood)));
}

/** Raise mood from an interaction (pet, play, decorate) and stamp lastCare. */
export function careForCreature(save: SaveData, moodDelta: number): SaveData {
  return {
    ...save,
    habitat: {
      ...save.habitat,
      mood: clampMood(save.habitat.mood + moodDelta),
      lastCare: new Date().toISOString(),
    },
  };
}

/** Neglect decay: −10 mood per full day away, floored at 20. */
export function applyMoodDecay(save: SaveData): SaveData {
  const days = Math.floor(
    (Date.now() - new Date(save.habitat.lastCare).getTime()) / 86_400_000,
  );
  if (days <= 0) return save;
  return {
    ...save,
    habitat: {
      ...save.habitat,
      mood: Math.max(20, save.habitat.mood - 10 * days),
      lastCare: new Date().toISOString(),
    },
  };
}

/* ---------------- shared store ----------------
   One in-memory save shared by every component (DemoPanel, Habitat, Home…),
   synced to localStorage. useSyncExternalStore keeps all subscribers live. */

let store: SaveData | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => store;
const getServerSnapshot = () => null;

/** Apply an update to the shared save: memory + localStorage + all subscribers. */
export function mutateSave(updater: (s: SaveData) => SaveData): SaveData {
  const next = updater(store ?? loadSave());
  store = next;
  persistSave(next);
  emit();
  return next;
}

/** React hook: hydration-safe access to the shared save. */
export function useSave() {
  const save = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Lazy-load from localStorage after hydration (once, whichever hook mounts first).
  useEffect(() => {
    if (store === null) {
      store = loadSave();
      emit();
    }
  }, []);

  const update = useCallback((updater: (s: SaveData) => SaveData) => {
    mutateSave(updater);
  }, []);

  const reset = useCallback(() => {
    resetSave();
    store = emptySave();
    emit();
  }, []);

  return { save, update, reset, loaded: save !== null };
}
