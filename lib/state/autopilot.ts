"use client";

import { useEffect, useSyncExternalStore } from "react";
import { FILM_MODE } from "@/lib/game/config";

// Auto-demo: a self-running tour that drives the REAL screens (no mock reel)
// so a take needs no clicking. Each screen contributes its own auto-behaviour
// and sets a caption; this store carries the tour state across navigations.
//
// State lives in sessionStorage so a mid-tour reload resumes rather than
// stranding the app in a half-driven state.

export interface AutopilotState {
  active: boolean;
  /** Narration line shown by AutoplayOverlay. */
  caption: string;
  battlesDone: number;
  seenHabitat: boolean;
  /**
   * false = the spec's 90-second film path: ends on the hero shot right
   * after evolution. true = full tour, continuing into habitat and dex.
   */
  full: boolean;
}

const KEY = "vivaria-autopilot";
const IDLE: AutopilotState = {
  active: false,
  caption: "",
  battlesDone: 0,
  seenHabitat: false,
  full: false,
};

let state: AutopilotState = IDLE;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const getSnapshot = () => state;
const getServerSnapshot = () => IDLE;

function persist(): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function setAuto(patch: Partial<AutopilotState>): void {
  state = { ...state, ...patch };
  persist();
  emit();
}

export function startAutopilot(full = false): void {
  state = { ...IDLE, active: true, full };
  persist();
  emit();
}

export function stopAutopilot(): void {
  state = IDLE;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {}
  emit();
}

/**
 * Pacing helper. The tour is a highlight reel, not a playthrough — beats are
 * tuned short so the viewer sees a feature and moves on. Film Mode stretches
 * everything back out when you need the camera to linger.
 */
export function beat(ms: number): number {
  return Math.round(ms * (FILM_MODE ? 1.45 : 1));
}

export function useAutopilot(): AutopilotState {
  const auto = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) {
        state = { ...IDLE, ...(JSON.parse(raw) as Partial<AutopilotState>) };
        emit();
      }
    } catch {}
  }, []);

  return auto;
}
