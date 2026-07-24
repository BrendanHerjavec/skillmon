import { z } from "zod";

export const QuestionSchema = z.object({
  q: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  a: z.number().int().min(0).max(3),
  why: z.string().min(1),
});

export const QuizResponseSchema = z.object({
  questions: z.array(QuestionSchema).min(1),
});

export const QuizRequestSchema = z.object({
  skill: z.string().min(1).max(80),
  level: z.number().int().min(1).max(99),
  count: z.number().int().min(1).max(12),
});

export const CreatureLineResponseSchema = z.object({
  type: z.enum(["logic", "craft", "influence"]),
  stageNames: z.array(z.string().min(2).max(24)).length(3),
  lore: z.string().min(10).max(600),
});

export const CreatureRequestSchema = z.object({
  skill: z.string().min(1).max(60),
});

export type QuizResponse = z.infer<typeof QuizResponseSchema>;
export type CreatureLineResponse = z.infer<typeof CreatureLineResponseSchema>;
