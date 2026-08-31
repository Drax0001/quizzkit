"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gradeAnswerAction } from "../actions";
import type { AnswerOption } from "@/lib/quiz-engine";

export type QuestionView = {
  id: string;
  text: string;
  options: Record<AnswerOption, string>;
};

export type GradedAnswer = {
  questionId: string;
  selected: AnswerOption | null;
  isCorrect: boolean;
  correctOption: AnswerOption;
  explanation: string | null;
};

const OPTIONS: AnswerOption[] = ["a", "b", "c", "d"];

export function QuestionCard({
  question,
  index,
  total,
  onGraded,
}: {
  question: QuestionView;
  index: number;
  total: number;
  onGraded: (result: GradedAnswer) => void;
}) {
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [graded, setGraded] = useState<GradedAnswer | null>(null);
  const [grading, setGrading] = useState(false);

  async function pick(option: AnswerOption) {
    if (selected || grading) return;
    setSelected(option);
    setGrading(true);
    const result = await gradeAnswerAction(question.id, option);
    const gradedAnswer: GradedAnswer = {
      questionId: question.id,
      selected: option,
      ...result,
    };
    setGraded(gradedAnswer);
    setGrading(false);
    onGraded(gradedAnswer);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Question {index + 1} of {total}
        </p>
        <p className="text-lg font-semibold leading-snug">{question.text}</p>
        <div className="grid gap-2">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt;
            const isCorrectOption = graded?.correctOption === opt;
            const showAsCorrect = graded && isCorrectOption;
            const showAsWrong = graded && isSelected && !graded.isCorrect;
            return (
              <Button
                key={opt}
                type="button"
                variant="outline"
                className={cn(
                  "h-auto justify-start whitespace-normal py-3 text-left",
                  isSelected && !graded && "border-primary",
                  showAsCorrect &&
                    "border-green-600 bg-green-50 text-green-900 hover:bg-green-50 dark:bg-green-950 dark:text-green-100",
                  showAsWrong &&
                    "border-destructive bg-red-50 text-red-900 hover:bg-red-50 dark:bg-red-950 dark:text-red-100",
                )}
                onClick={() => pick(opt)}
                disabled={selected !== null}
              >
                <span className="mr-2 font-mono text-xs uppercase opacity-70">
                  {opt}
                </span>
                {question.options[opt]}
              </Button>
            );
          })}
        </div>
        {graded?.explanation && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {graded.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
