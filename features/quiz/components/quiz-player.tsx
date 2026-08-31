"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  QuestionCard,
  type GradedAnswer,
  type QuestionView,
} from "./question-card";
import { submitAttemptAction } from "../actions";
import { medalAwardKey, medalEarnedAt, nextStreak } from "@/lib/quiz-engine";
import type { QuizSetupInput } from "../schemas";

export function QuizPlayer({
  questions,
  setup,
}: {
  questions: QuestionView[];
  setup: QuizSetupInput;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<GradedAnswer[]>([]);
  const [streak, setStreak] = useState(0);
  const [shownMedals, setShownMedals] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[index];

  async function finish(finalAnswers: GradedAnswer[]) {
    setSubmitting(true);
    const result = await submitAttemptAction({
      quizType: "bank",
      category: setup.categoryId,
      answers: finalAnswers.map(({ questionId, selected }) => ({
        questionId,
        selected,
      })),
    });
    router.push(`/results/${result.attemptId}`);
  }

  function handleGraded(result: GradedAnswer) {
    const updated = [...answers, result];
    setAnswers(updated);

    const newStreak = nextStreak(streak, result.isCorrect);
    setStreak(newStreak);

    const medal = medalEarnedAt(newStreak);
    if (medal) {
      const key = medalAwardKey(medal, newStreak);
      if (!shownMedals.includes(key)) {
        setShownMedals((prev) => [...prev, key]);
        toast.success(
          `${medal[0]!.toUpperCase()}${medal.slice(1)} medal — ${newStreak} in a row 🔥`,
        );
      }
    } else if (result.isCorrect) {
      toast.success("Correct!", { duration: 900 });
    } else {
      toast.error("Not quite.", { duration: 900 });
    }

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
      } else {
        void finish(updated);
      }
    }, 900);
  }

  if (submitting) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Scoring your quiz…
      </p>
    );
  }

  if (!question) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No questions available for this setup.
      </p>
    );
  }

  return (
    <QuestionCard
      key={question.id}
      question={question}
      index={index}
      total={questions.length}
      onGraded={handleGraded}
    />
  );
}
