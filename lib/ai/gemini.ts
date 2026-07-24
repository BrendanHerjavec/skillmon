// Nano Banana (Gemini image API) sprite pipeline — Phase 3 (SPEC §5).
// Generates a 3-stage evolution line by reference-chaining: stage 0 from a
// text prompt, stages 1-2 by passing the previous stage's image as reference
// so the line reads as the same species. Sprites are generated ONCE at
// creature-creation time and cached (never during a battle).
//
// Without GEMINI_API_KEY this module is inert and the app uses procedural
// SVG sprites — Demo Mode never depends on it.

const MODEL = "gemini-2.5-flash-image";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const TYPE_LIGHT: Record<string, string> = {
  logic: "emerald green rim light",
  craft: "violet purple rim light",
  influence: "amber gold rim light",
};

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function stagePrompt(creatureName: string, type: string, stage: number, skill: string): string {
  const base = `chibi holographic creature, dark navy background (#0A0D1E), ${TYPE_LIGHT[type] ?? "soft rim light"}, centered, full body, no text, no watermark, clean silhouette, game sprite style`;
  if (stage === 0) {
    return `A small, cute creature named ${creatureName} that embodies learning ${skill}. ${base}`;
  }
  return `Evolve this exact creature into ${creatureName}: larger, more defined and powerful, keep the same colors, species and silhouette lineage. ${base}`;
}

async function generateImage(prompt: string, referencePngBase64?: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (referencePngBase64) {
    parts.unshift({ inline_data: { mime_type: "image/png", data: referencePngBase64 } });
  }

  const res = await fetch(`${API}?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!img) throw new Error("Gemini returned no image");
  return img;
}

/**
 * Generate all 3 stages for a creature line via reference-chaining.
 * Returns base64 PNGs; the caller uploads them to Supabase Storage.
 */
export async function generateSpriteLine(
  stageNames: [string, string, string],
  type: string,
  skill: string,
): Promise<[string, string, string]> {
  const s0 = await generateImage(stagePrompt(stageNames[0], type, 0, skill));
  const s1 = await generateImage(stagePrompt(stageNames[1], type, 1, skill), s0);
  const s2 = await generateImage(stagePrompt(stageNames[2], type, 2, skill), s1);
  return [s0, s1, s2];
}
