"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DECOR, decorById, isUnlocked } from "@/content/decor";
import { CONFIG } from "@/lib/game/config";
import { applyMoodDecay, careForCreature, useSave } from "@/lib/state/save";
import { Bar, TypeBadge } from "@/components/ui";
import { DecorSprite } from "@/components/DecorSprite";
import { CreatureSprite, typePalette } from "@/lib/sprites/CreatureSprite";
import { DemoPanel } from "@/components/DemoPanel";
import { MinigameModal } from "@/components/minigames/MinigameModal";
import { beat, setAuto, useAutopilot } from "@/lib/state/autopilot";
import { sfx } from "@/lib/audio/sfx";

// The habitat: where an unlocked creature actually lives. Pet it, play with
// it, decorate its home with props earned from battles — a happy creature
// (mood ≥ CONFIG.happyMoodMin) fights with an XP bonus.

// Positions are tuned to the generated room art: the floor plane starts around
// 60% height, so props sit between 66% and 90% and further-back spots (lower
// y) render smaller. The middle is left clear for the creature.
// Kept clear of the creature's wander band (x 38–63) so props never hide
// behind it.
const SPOTS: { x: number; y: number }[] = [
  { x: 11, y: 70 },
  { x: 26, y: 84 },
  { x: 30, y: 66 },
  { x: 71, y: 66 },
  { x: 76, y: 84 },
  { x: 90, y: 70 },
  { x: 44, y: 92 },
  { x: 60, y: 92 },
];

/** Anchor points the creature wanders between, all on the floor plane. */
const ANCHORS: { x: number; y: number }[] = [
  { x: 38, y: 62 },
  { x: 52, y: 68 },
  { x: 63, y: 60 },
  { x: 47, y: 58 },
];

function moodLabel(mood: number): string {
  if (mood >= 85) return "Blissful";
  if (mood >= CONFIG.happyMoodMin) return "Happy";
  if (mood >= 50) return "Content";
  if (mood >= 30) return "Restless";
  return "Gloomy";
}

interface HeartBurst {
  id: number;
  dx: number;
}

export default function HabitatPage() {
  const router = useRouter();
  const { save, update, loaded } = useSave();
  const auto = useAutopilot();
  const [anchor, setAnchor] = useState(0);
  const [placing, setPlacing] = useState<string | null>(null);
  const [hearts, setHearts] = useState<HeartBurst[]>([]);
  const [trick, setTrick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const heartId = useRef(0);
  const decayed = useRef(false);

  // Neglect decay once per visit.
  useEffect(() => {
    if (!loaded || decayed.current) return;
    decayed.current = true;
    update((s) => applyMoodDecay(s));
  }, [loaded, update]);

  // Redirect in an effect — navigating during render warns and can loop.
  useEffect(() => {
    if (loaded && !save?.creature) router.replace("/starter");
  }, [loaded, save?.creature, router]);

  // Tour step: pet it, drop in a piece of earned decor, then a mini-game.
  useEffect(() => {
    if (!auto.active) return;
    setAuto({ caption: "This is its habitat. Pet it, play with it, decorate it." });
    const ts = [
      setTimeout(() => pet(), beat(1600)),
      setTimeout(() => pet(), beat(2400)),
      setTimeout(() => pet(), beat(3200)),
      setTimeout(() => {
        setAuto({ caption: "Decor unlocks by winning — this one came from your first victory." });
        setPlacing("terminal");
      }, beat(4600)),
      setTimeout(() => placeItem("terminal", 4), beat(6400)),
      setTimeout(() => {
        setAuto({ caption: "Mini-games keep its mood up — and a happy creature earns bonus XP in battle." });
        setPlaying(true);
      }, beat(8200)),
      setTimeout(() => {
        setPlaying(false);
        setAuto({ seenHabitat: true });
        router.push("/home");
      }, beat(22000)),
    ];
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto.active]);

  // Esc cancels placement mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlacing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Wander between anchors.
  useEffect(() => {
    const iv = setInterval(() => {
      setAnchor((a) => {
        let next = Math.floor(Math.random() * ANCHORS.length);
        if (next === a) next = (next + 1) % ANCHORS.length;
        return next;
      });
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  if (!loaded || !save?.creature) return <main className="min-h-dvh" />;

  const c = save.creature;
  const p = typePalette(c.line.type);
  const habitat = save.habitat;
  const happy = habitat.mood >= CONFIG.happyMoodMin;
  const pos = ANCHORS[anchor];

  const pet = () => {
    sfx.pet();
    update((s) => careForCreature(s, 6));
    const bursts = Array.from({ length: 3 }, (_, i) => ({
      id: heartId.current++,
      dx: (i - 1) * 22 + Math.round(Math.random() * 10 - 5),
    }));
    setHearts((h) => [...h, ...bursts]);
    setTimeout(
      () => setHearts((h) => h.filter((b) => !bursts.some((n) => n.id === b.id))),
      1000,
    );
  };

  // "Play" opens the minigames; a scoring round triggers the celebration trick.
  const play = () => setPlaying(true);

  /** Place a specific item — takes the id so callers (incl. the auto-demo)
      never depend on the current `placing` selection. */
  const placeItem = (itemId: string, spot: number) => {
    sfx.place();
    update((s) =>
      careForCreature(
        {
          ...s,
          habitat: {
            ...s.habitat,
            placed: [
              ...s.habitat.placed.filter((d) => d.spot !== spot && d.itemId !== itemId),
              { itemId, spot },
            ],
          },
        },
        3,
      ),
    );
    setPlacing(null);
  };

  const placeAt = (spot: number) => {
    if (!placing) return;
    placeItem(placing, spot);
  };

  const removeAt = (spot: number) => {
    update((s) => ({
      ...s,
      habitat: { ...s.habitat, placed: s.habitat.placed.filter((d) => d.spot !== spot) },
    }));
  };

  const placedIds = new Set(habitat.placed.map((d) => d.itemId));

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">habitat</p>
          <h1 className="font-display mt-1 text-3xl" style={{ color: p.main }}>
            {c.line.stageNames[c.stage]}&apos;s Den
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TypeBadge type={c.line.type} />
          <Link href="/home" className="eyebrow underline-offset-4 hover:underline">
            ← Home
          </Link>
        </div>
      </div>

      {/* mood */}
      <div className="panel mt-5 flex flex-wrap items-center gap-4 px-5 py-4">
        <span className="font-display text-sm">{moodLabel(habitat.mood)}</span>
        <div className="min-w-40 flex-1">
          <Bar value={habitat.mood} max={100} color={happy ? "var(--logic)" : "var(--influence)"} label="Mood" />
        </div>
        <span className="text-xs text-dim">
          {happy
            ? `happy — +${CONFIG.happyXp} XP in battles`
            : `reach ${CONFIG.happyMoodMin} mood for a +${CONFIG.happyXp} XP battle bonus`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={pet}
            className="eyebrow cursor-pointer rounded-md border-2 border-panel-border px-3 py-2 hover:border-hp hover:text-ink"
          >
            ♥ pet
          </button>
          <button
            onClick={play}
            className="eyebrow cursor-pointer rounded-md border-2 border-panel-border px-3 py-2 hover:border-xp hover:text-ink"
          >
            ✦ play
          </button>
        </div>
      </div>

      {/* ---- scene ---- */}
      {/* The den reads as a lit vivarium sitting on the page — dark interior so
          the creature render and the glowing decor stay readable. */}
      <div
        className="plate relative mt-5 w-full overflow-hidden"
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* Painted room backdrop, generated per type by `npm run rooms`.
            Each render deliberately leaves the centre and floor empty so the
            creature and its decor composite cleanly on top. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/rooms/${c.line.type}.png`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        {/* Vignette + floor haze: pushes the backdrop back so the glossy
            creature in front reads as the subject. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 42%, transparent 0%, rgba(6,9,16,0.55) 100%),
                         linear-gradient(to bottom, rgba(6,9,16,0.35) 0%, transparent 30%, rgba(6,9,16,0.4) 100%)`,
          }}
          aria-hidden
        />
        {/* warm pool of light the creature stands in */}
        <div
          className="pointer-events-none absolute inset-x-[14%] bottom-[6%] h-[34%] rounded-[50%]"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${p.main}2e 0%, transparent 70%)` }}
          aria-hidden
        />

        {/* decor */}
        {habitat.placed.map((d) => {
          const spot = SPOTS[d.spot];
          if (!spot || !decorById(d.itemId)) return null;
          return (
            <button
              key={d.spot}
              onClick={() => removeAt(d.spot)}
              title={`${decorById(d.itemId)!.name} — click to put away`}
              className="absolute cursor-pointer transition-transform hover:scale-110"
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: "translate(-50%, -60%)",
                // Props further back sit smaller — cheap depth cue.
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))",
              }}
            >
              <DecorSprite id={d.itemId} size={Math.round(58 + (spot.y / 100) * 34)} />
            </button>
          );
        })}

        {/* free spot markers while placing */}
        {placing &&
          SPOTS.map((spot, i) =>
            habitat.placed.some((d) => d.spot === i) ? null : (
              <button
                key={i}
                onClick={() => placeAt(i)}
                aria-label={`Place at spot ${i + 1}`}
                className="absolute h-10 w-14 cursor-pointer rounded-[50%] border-2 border-dashed"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: "translate(-50%, -60%)",
                  borderColor: "var(--xp)",
                  background: "#60a5fa22",
                }}
              />
            ),
          )}

        {/* the creature */}
        <button
          onClick={pet}
          aria-label={`Pet ${c.line.stageNames[c.stage]}`}
          className="absolute cursor-pointer"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 2.6s ease-in-out, top 2.6s ease-in-out",
          }}
        >
          {/* grounding shadow, so the creature stands in the room */}
          <span
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
            style={{
              bottom: -14,
              width: 96,
              height: 18,
              background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
              filter: "blur(3px)",
            }}
            aria-hidden
          />
          <div key={trick} className={trick ? "anim-trick" : "anim-float"}>
            <CreatureSprite line={c.line} stage={c.stage} size={148} blend />
          </div>
          {/* pet hearts */}
          {hearts.map((h) => (
            <span
              key={h.id}
              className="anim-damage-pop absolute top-0 text-xl"
              style={{ left: `calc(50% + ${h.dx}px)`, color: "var(--hp)" }}
            >
              ♥
            </span>
          ))}
          {happy && (
            <span className="absolute -right-2 -top-2 text-lg" style={{ color: "var(--influence)" }}>
              ✦
            </span>
          )}
        </button>

        {placing && (
          <p className="eyebrow absolute left-1/2 top-3 -translate-x-1/2 rounded-sm bg-bg/80 px-3 py-1">
            pick a spot for {decorById(placing)?.name} · esc to cancel
          </p>
        )}
      </div>

      {/* ---- decor inventory / unlock ladder ---- */}
      <p className="eyebrow mt-6 mb-2">decor — earned by battling</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {DECOR.map((item) => {
          const unlocked = isUnlocked(item, save);
          const placed = placedIds.has(item.id);
          const selected = placing === item.id;
          return (
            <button
              key={item.id}
              disabled={!unlocked}
              onClick={() => setPlacing(selected ? null : placed ? null : item.id)}
              title={unlocked ? item.name : `Locked — ${item.unlockHint}`}
              className={`panel flex cursor-pointer flex-col items-center gap-1 p-3 text-center transition-transform hover:scale-105 disabled:cursor-not-allowed ${placed ? "opacity-60" : ""}`}
              style={selected ? { borderColor: "var(--xp)", boxShadow: "0 0 14px #60a5fa55" } : undefined}
            >
              {unlocked ? (
                <DecorSprite id={item.id} size={56} />
              ) : (
                // A sealed slot reads better than a silhouetted sprite, which
                // turns detailed props into grey blobs.
                <div
                  className="grid place-items-center rounded-xl"
                  style={{
                    width: 56,
                    height: 56,
                    background: "var(--bg-deep)",
                    border: "1px dashed var(--panel-border)",
                  }}
                >
                  <span className="font-display text-lg text-dim/60">?</span>
                </div>
              )}
              <span className="text-[11px] leading-tight">{unlocked ? item.name : "???"}</span>
              <span className="text-[10px] leading-tight text-dim">
                {unlocked ? (placed ? "placed" : selected ? "pick a spot" : "tap to place") : item.unlockHint}
              </span>
            </button>
          );
        })}
      </div>

      {playing && (
        <MinigameModal
          line={c.line}
          auto={auto.active}
          onClose={() => setPlaying(false)}
          onReward={() => setTrick((t) => t + 1)}
        />
      )}

      <DemoPanel />
    </main>
  );
}
