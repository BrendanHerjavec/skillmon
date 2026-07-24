import { NextResponse } from "next/server";
import { generateQuiz } from "@/lib/ai";
import { QuizRequestSchema } from "@/lib/ai/schemas";
import { shuffleQuestion } from "@/lib/game/shuffle";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = QuizRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { skill, level, count } = parsed.data;
  const { questions, source } = await generateQuiz(skill, level, count);

  // Shuffle options server-side and remap the answer index (SPEC §6).
  const shuffledQuestions = questions.map((q) => shuffleQuestion(q));

  return NextResponse.json({ questions: shuffledQuestions, source });
}
