"use client";

import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { quizQuestionsOptions } from "../queries";
import { QuizPlayer } from "./quiz-player";
import type { QuizSetupInput } from "../schemas";

function QuizPlayInner({ setup }: { setup: QuizSetupInput }) {
  const { data: questions } = useSuspenseQuery(quizQuestionsOptions(setup));
  return <QuizPlayer questions={questions} setup={setup} />;
}

export function QuizPlayClient({ setup }: { setup: QuizSetupInput }) {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading questions…
        </p>
      }
    >
      <QuizPlayInner setup={setup} />
    </Suspense>
  );
}
