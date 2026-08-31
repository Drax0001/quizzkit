import { z } from "zod";

export const answerOptionSchema = z.enum(["a", "b", "c", "d"]);

export const quizSetupSchema = z.object({
  categoryId: z.string().optional(), // omitted = all categories
  count: z.number().int().min(1).max(50).default(10),
  mode: z.enum(["normal", "chrono"]).default("normal"),
  timerSeconds: z.number().int().min(5).max(60).default(20),
  order: z.enum(["random", "sequential"]).default("random"),
});
export type QuizSetupInput = z.infer<typeof quizSetupSchema>;

type SearchParamValue = string | string[] | undefined;

/**
 * URLSearchParams are always strings — this is the one place that coerces
 * them before handing off to the schema above, so the schema itself (and
 * the RHF form that shares it) can stay strictly typed as numbers.
 */
export function quizSetupFromSearchParams(
  raw: Record<string, SearchParamValue>,
): QuizSetupInput {
  const first = (v: SearchParamValue) => (Array.isArray(v) ? v[0] : v);
  const asNumber = (v: SearchParamValue) => {
    const value = first(v);
    return value === undefined || value === "" ? undefined : Number(value);
  };

  return quizSetupSchema.parse({
    categoryId: first(raw.categoryId),
    count: asNumber(raw.count),
    mode: first(raw.mode),
    order: first(raw.order),
    timerSeconds: asNumber(raw.timerSeconds),
  });
}

// Only questionId + what the player picked are trusted from the client —
// "correct" and "isCorrect" are recomputed server-side in actions.ts from
// the database, never taken from the caller. See the comment there.
export const submitAttemptSchema = z.object({
  quizType: z.enum(["bank", "custom"]).default("bank"),
  quizId: z.string().optional(),
  category: z.string().optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selected: answerOptionSchema.nullable(),
      }),
    )
    .min(1),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
