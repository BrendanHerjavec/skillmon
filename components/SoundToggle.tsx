"use client";

import { useEffect, useSyncExternalStore } from "react";
import { initAudio, isMuted, setMuted, sfx, subscribeMute } from "@/lib/audio/sfx";

// Small persistent mute control. Sound defaults ON (it's a game, and the
// stingers are a big part of the demo's polish), but a recording session or a
// quiet office needs one obvious click to silence it.

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMute, isMuted, () => false);

  useEffect(() => {
    initAudio();
  }, []);

  return (
    <button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) sfx.tap(); // confirm audibly when switching back on
      }}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      title={muted ? "Sound off" : "Sound on"}
      className="fixed bottom-4 left-4 z-50 grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-transform hover:-translate-y-0.5"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        boxShadow: "var(--shadow-sm)",
        color: muted ? "var(--text-dim)" : "var(--logic)",
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 L6 9 H2 v6 h4 l5 4 Z" fill="currentColor" stroke="none" />
        {muted ? (
          <>
            <line x1="16" y1="9" x2="22" y2="15" />
            <line x1="22" y1="9" x2="16" y2="15" />
          </>
        ) : (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        )}
      </svg>
    </button>
  );
}
