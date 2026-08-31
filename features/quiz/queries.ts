import { queryOptions } from "@tanstack/react-query";
import { getQuizQuestionsAction } from "./actions";
import type { QuizSetupInput } from "./schemas";

// Query key factory — every key shape for the "quiz" entity lives here so
// invalidation never has to guess at an inline array shape elsewhere.
export const quizKeys = {
  all: ["quiz"] as const,
  questions: (params: QuizSetupInput) =>
    [...quizKeys.all, "questions", params] as const,
};

export function quizQuestionsOptions(params: QuizSetupInput) {
  return queryOptions({
    queryKey: quizKeys.questions(params),
    queryFn: () => getQuizQuestionsAction(params),
    staleTime: 0, // a fresh draw every time setup params change
    gcTime: 5 * 60 * 1000,
  });
}
