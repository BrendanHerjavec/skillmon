"use client";

import { useEffect } from "react";
import { stopAutopilot, useAutopilot } from "@/lib/state/autopilot";

// Film furniture for the auto-demo: a small "auto" pill and the narration
// caption. Sits above everything (the scanline layer is z-60) and hides the
// cursor so a recording has no stray pointer drifting across the frame.

export function AutoplayOverlay() {
  const auto = useAutopilot();

  useEffect(() => {
    if (!auto.active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopAutopilot();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [auto.active]);

  if (!auto.active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[70] flex flex-col items-center gap-3 px-6">
      <span
        className="eyebrow rounded-full px-3 py-1.5"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        ● auto demo · esc to exit
      </span>

      {auto.caption && (
        <p
          key={auto.caption}
          className="font-display anim-rise max-w-2xl rounded-2xl px-6 py-3.5 text-center text-lg leading-snug sm:text-xl"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--panel-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {auto.caption}
        </p>
      )}
    </div>
  );
}
