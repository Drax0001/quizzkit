"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { requireProfile, requireSession } from "@/lib/session";
import {
  quizSetupSchema,
  submitAttemptSchema,
  type QuizSetupInput,
  type SubmitAttemptInput,
} from "./schemas";
import {
  gradeAnswer,
  medalEarnedAt,
  nextStreak,
  scoreAttempt,
  type AnswerOption,
  type AnsweredQuestion,
  type Medal,
} from "@/lib/quiz-engine";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function getQuizQuestionsAction(input: QuizSetupInput) {
  const parsed = quizSetupSchema.parse(input);
  const profile = await requireProfile();

  const pool = await db.question.findMany({
    where: parsed.categoryId ? { categoryId: parsed.categoryId } : undefined,
  });

  const answeredIds = new Set(profile.answeredQuestionIds as string[]);
  const unanswered = pool.filter((q) => !answeredIds.has(q.id));
  const source = unanswered.length > 0 ? unanswered : pool;
  const ordered = parsed.order === "random" ? shuffle(source) : source;

  return ordered.slice(0, parsed.count).map((q) => ({
    id: q.id,
    text: q.text,
    options: {
      a: q.optionA,
      b: q.optionB,
      c: q.optionC,
      d: q.optionD,
    },
  }));
}

/**
 * Grades a single answer for instant in-quiz feedback (color flash, streak
 * tick, medal popup). The final submitAttemptAction below re-grades every
 * answer independently at submit time, so a tampered client-side call here
 * can't change the persisted score — this is purely a UX round-trip.
 */
export async function gradeAnswerAction(
  questionId: string,
  selected: AnswerOption | null,
) {
  await requireSession();
  const question = await db.question.findUniqueOrThrow({
    where: { id: questionId },
  });
  const correct = question.correctOption as AnswerOption;
  return {
    isCorrect: gradeAnswer(selected, correct),
    correctOption: correct,
    explanation: question.explanation,
  };
}

/**
 * `selected` is the only untrusted input this action reads per answer.
 * The correct option and whether it was a hit are always recomputed here
 * from the database — never taken from the client. Trusting a client-sent
 * `isCorrect` would let anyone submit a perfect score for free.
 */
export async function submitAttemptAction(input: SubmitAttemptInput) {
  const session = await requireSession();
  const parsed = submitAttemptSchema.parse(input);
  const profile = await requireProfile();

  const questionIds = parsed.answers.map((a) => a.questionId);
  const questions = await db.question.findMany({
    where: { id: { in: questionIds } },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const graded: AnsweredQuestion[] = parsed.answers.map((a) => {
    const question = byId.get(a.questionId);
    const correct = (question?.correctOption ?? "a") as AnswerOption;
    return {
      questionId: a.questionId,
      selected: a.selected,
      correct,
      isCorrect: question ? gradeAnswer(a.selected, correct) : false,
    };
  });

  const { score, total, percentage } = scoreAttempt(graded);

  const attempt = await db.attempt.create({
    data: {
      profileId: profile.id,
      quizType: parsed.quizType,
      quizId: parsed.quizId,
      category: parsed.category,
      score,
      total,
      percentage,
      // Prisma's Json input type wants an index signature a typed array
      // literal doesn't structurally have — the array is already
      // JSON-safe (plain strings/booleans), so this cast is sound.
      answers: graded as unknown as Prisma.InputJsonValue,
    },
  });

  // Walk the graded sequence to find every medal threshold crossed during
  // this attempt (a long streak can cross more than one), then persist the
  // final tallies in a single update.
  let streak = profile.currentStreak;
  const earnedMedals: Medal[] = [];
  const newlyCorrectIds: string[] = [];
  for (const a of graded) {
    streak = nextStreak(streak, a.isCorrect);
    if (a.isCorrect) newlyCorrectIds.push(a.questionId);
    const medal = medalEarnedAt(streak);
    if (medal) earnedMedals.push(medal);
  }

  const answeredSet = new Set(profile.answeredQuestionIds as string[]);
  newlyCorrectIds.forEach((id) => answeredSet.add(id));

  const medalIncrements = earnedMedals.reduce(
    (acc, medal) => {
      acc[medal] += 1;
      return acc;
    },
    { bronze: 0, silver: 0, gold: 0 } as Record<Medal, number>,
  );

  await db.profile.update({
    where: { id: profile.id },
    data: {
      currentStreak: streak,
      bestStreak: Math.max(profile.bestStreak, streak),
      totalQuizzes: profile.totalQuizzes + 1,
      totalPoints: answeredSet.size,
      answeredQuestionIds: Array.from(answeredSet),
      medalsBronze: { increment: medalIncrements.bronze },
      medalsSilver: { increment: medalIncrements.silver },
      medalsGold: { increment: medalIncrements.gold },
      lastSeenAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");

  return {
    attemptId: attempt.id,
    score,
    total,
    percentage,
    earnedMedals,
    playerEmail: session.user.email,
  };
}
