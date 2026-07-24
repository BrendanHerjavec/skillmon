// Server-only Claude API client. Every caller has a deterministic fallback —
// nothing user-facing may depend on this succeeding (Demo Mode pillar).

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

export function hasClaudeKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Call Claude expecting a raw JSON body back. Throws on any failure; callers catch and fall back. */
export async function claudeJson(
  system: string,
  user: string,
  { maxTokens = 2000, timeoutMs = 9000 }: { maxTokens?: number; timeoutMs?: number } = {},
): Promise<unknown> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const text = data.content.find((c) => c.type === "text")?.text ?? "";
    // Tolerate accidental markdown fences despite the "JSON only" instruction.
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timer);
  }
}
