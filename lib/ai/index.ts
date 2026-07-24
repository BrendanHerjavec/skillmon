// Typed AI interfaces (server-side). Each function tries Claude when a key is
// present and always has a deterministic fallback — Demo Mode never blocks on
// a live API call (SPEC §3).

import type { Question, CreatureLine } from "@/lib/game/types";
import { bandForLevel, fallbackQuestions } from "./fallbackQuestions";
import { claudeJson, hasClaudeKey } from "./claude";
import { QuizResponseSchema, CreatureLineResponseSchema } from "./schemas";
import { proceduralCreatureLine } from "./creatures";
import { hashString } from "@/lib/game/shuffle";

const BAND_LABEL = { beginner: "beginner", intermediate: "intermediate", advanced: "advanced" } as const;

export async function generateQuiz(skill: string, level: number, count: number): Promise<{
  questions: Question[];
  source: "claude" | "fallback";
}> {
  if (hasClaudeKey()) {
    const system =
      "You write quiz questions for a learning game. Respond with JSON only — no markdown fences, no commentary.";
    const band = BAND_LABEL[bandForLevel(level)];
    const user = `Write ${count} multiple-choice questions testing real ${skill} knowledge at ${band} difficulty (player level ${level}).
Rules: questions must be unambiguous, exactly one correct answer, plausible distractors, no trick questions.
Return JSON exactly in this shape:
{"questions":[{"q":"...","options":["a","b","c","d"],"a":0,"why":"one-line explanation of the correct answer"}]}`;

    // Retry once on invalid output, then fall back to the local bank.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await claudeJson(system, user);
        const parsed = QuizResponseSchema.safeParse(raw);
        if (parsed.success) return { questions: parsed.data.questions, source: "claude" };
      } catch {
        break; // network/timeout — don't burn time retrying, fall back
      }
    }
  }
  return { questions: fallbackQuestions(skill, level, count), source: "fallback" };
}

export async function generateCreatureLine(skill: string): Promise<{
  line: CreatureLine;
  source: "claude" | "fallback";
}> {
  if (hasClaudeKey()) {
    const system =
      "You invent original creatures for a learning RPG. Never reference or imitate Pokémon or any existing franchise: no existing creature names, no '-chu' endings, no 'Poké-' prefixes. Respond with JSON only — no markdown fences.";
    const user = `A player wants to learn the skill: "${skill}".
1. Assign one type: "logic" (analytical/technical), "craft" (making/design), or "influence" (people/persuasion).
2. Invent an ORIGINAL 3-stage creature line for this skill — stage 0 small and cute, stage 1 more defined, stage 2 majestic. Names must be original coinages that evoke the skill.
3. Write 2-3 sentences of dex lore tying the creature's growth to actually practicing the skill.
Return JSON exactly: {"type":"logic|craft|influence","stageNames":["s0","s1","s2"],"lore":"..."}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await claudeJson(system, user);
        const parsed = CreatureLineResponseSchema.safeParse(raw);
        if (parsed.success) {
          const d = parsed.data;
          return {
            line: {
              id: `custom-${hashString(skill.trim().toLowerCase()).toString(36)}`,
              skillName: skill.trim(),
              type: d.type,
              stageNames: d.stageNames as [string, string, string],
              lore: d.lore,
              seed: hashString(skill.trim().toLowerCase()),
            },
            source: "claude",
          };
        }
      } catch {
        break;
      }
    }
  }
  return { line: proceduralCreatureLine(skill), source: "fallback" };
}

/** One fresh taunt line for an enemy. Falls back to the enemy's canned taunts. */
export async function narrateBattle(enemyName: string, tagline: string, persona?: string): Promise<string | null> {
  if (!hasClaudeKey()) return null;
  try {
    const system = persona ?? `You are ${enemyName}, a mischievous "work demon" monster in a learning game. Tagline: ${tagline}. Stay playful, never mean-spirited.`;
    const raw = await claudeJson(system, 'Write ONE short taunt line (max 12 words) to open the battle. Return JSON: {"taunt":"..."}', { maxTokens: 100, timeoutMs: 4000 });
    const taunt = (raw as { taunt?: unknown })?.taunt;
    return typeof taunt === "string" && taunt.length > 0 ? taunt : null;
  } catch {
    return null;
  }
}
