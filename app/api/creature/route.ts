import { NextResponse } from "next/server";
import { generateCreatureLine } from "@/lib/ai";
import { CreatureRequestSchema } from "@/lib/ai/schemas";

// Custom-skill creature creation (SPEC §5). Sprite generation via the Nano
// Banana pipeline (lib/ai/gemini.ts) is wired at creation time when
// GEMINI_API_KEY + Supabase Storage are configured; otherwise the client
// renders procedural SVG sprites from the returned seed.

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreatureRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { line, source } = await generateCreatureLine(parsed.data.skill);
  return NextResponse.json({ line, source });
}
