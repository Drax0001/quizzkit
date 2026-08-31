export type AnswerOption = "a" | "b" | "c" | "d";

export interface AnsweredQuestion {
  questionId: string;
  selected: AnswerOption | null;
  correct: AnswerOption;
  isCorrect: boolean;
}

export interface AttemptScore {
  score: number;
  total: number;
  percentage: number;
}

export type Medal = "bronze" | "silver" | "gold";

/** Ordered highest-first — the first threshold a streak divides evenly wins. */
export const MEDAL_THRESHOLDS: { streak: number; medal: Medal }[] = [
  { streak: 10, medal: "gold" },
  { streak: 7, medal: "silver" },
  { streak: 5, medal: "bronze" },
];

export function gradeAnswer(
  selected: AnswerOption | null,
  correct: AnswerOption,
): boolean {
  return selected === correct;
}

export function scoreAttempt(answers: AnsweredQuestion[]): AttemptScore {
  const score = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percentage };
}

export function nextStreak(current: number, isCorrect: boolean): number {
  return isCorrect ? current + 1 : 0;
}

/** Returns the medal earned by reaching this streak, or null if none. */
export function medalEarnedAt(streak: number): Medal | null {
  if (streak <= 0) return null;
  for (const { streak: threshold, medal } of MEDAL_THRESHOLDS) {
    if (streak % threshold === 0) return medal;
  }
  return null;
}

/** Unique key per medal award, so a UI layer can dedupe within one session. */
export function medalAwardKey(medal: Medal, streak: number): string {
  const threshold = MEDAL_THRESHOLDS.find((t) => t.medal === medal)!.streak;
  return `${medal}-${Math.floor(streak / threshold)}`;
}
