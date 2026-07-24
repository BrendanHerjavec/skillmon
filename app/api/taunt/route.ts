import { NextResponse } from "next/server";
import { z } from "zod";
import { narrateBattle } from "@/lib/ai";

const TauntRequestSchema = z.object({
  enemyName: z.string().min(1).max(60),
  tagline: z.string().max(200).default(""),
  persona: z.string().max(1000).optional(),
});

// One fresh Claude taunt per battle; the client keeps its canned line if this
// returns null or is slow (fire-and-forget).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ taunt: null });
  }
  const parsed = TauntRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ taunt: null });

  const { enemyName, tagline, persona } = parsed.data;
  const taunt = await narrateBattle(enemyName, tagline, persona);
  return NextResponse.json({ taunt });
}
