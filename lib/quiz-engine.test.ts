import { describe, expect, it } from "vitest";
import {
  gradeAnswer,
  medalAwardKey,
  medalEarnedAt,
  nextStreak,
  scoreAttempt,
} from "./quiz-engine";

describe("gradeAnswer", () => {
  it("matches the correct option", () => {
    expect(gradeAnswer("b", "b")).toBe(true);
    expect(gradeAnswer("a", "b")).toBe(false);
    expect(gradeAnswer(null, "b")).toBe(false);
  });
});

describe("scoreAttempt", () => {
  it("computes score, total, and a rounded percentage", () => {
    const answers = [
      { questionId: "1", selected: "a", correct: "a", isCorrect: true },
      { questionId: "2", selected: "b", correct: "a", isCorrect: false },
      { questionId: "3", selected: "a", correct: "a", isCorrect: true },
    ] as const;
    expect(scoreAttempt([...answers])).toEqual({
      score: 2,
      total: 3,
      percentage: 67,
    });
  });

  it("returns 0% for an empty attempt instead of dividing by zero", () => {
    expect(scoreAttempt([])).toEqual({ score: 0, total: 0, percentage: 0 });
  });
});

describe("nextStreak", () => {
  it("increments on a hit and resets to zero on a miss", () => {
    expect(nextStreak(4, true)).toBe(5);
    expect(nextStreak(4, false)).toBe(0);
  });
});

describe("medalEarnedAt", () => {
  it("awards bronze at 5, silver at 7, gold at 10", () => {
    expect(medalEarnedAt(5)).toBe("bronze");
    expect(medalEarnedAt(7)).toBe("silver");
    expect(medalEarnedAt(10)).toBe("gold");
  });

  it("prefers the higher threshold when a streak divides more than one", () => {
    // 10 is divisible by both 10 (gold) and 5 (bronze) — gold must win.
    expect(medalEarnedAt(10)).toBe("gold");
  });

  it("returns null between thresholds and at zero", () => {
    expect(medalEarnedAt(6)).toBeNull();
    expect(medalEarnedAt(0)).toBeNull();
  });
});

describe("medalAwardKey", () => {
  it("produces a distinct key per medal per multiple of its threshold", () => {
    expect(medalAwardKey("bronze", 5)).toBe("bronze-1");
    expect(medalAwardKey("bronze", 10)).toBe("bronze-2");
    expect(medalAwardKey("bronze", 10)).not.toBe(medalAwardKey("gold", 10));
  });
});
