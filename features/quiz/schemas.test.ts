import { describe, expect, it } from "vitest";
import { quizSetupFromSearchParams, quizSetupSchema } from "./schemas";

describe("quizSetupSchema", () => {
  it("applies sensible defaults when a field is omitted", () => {
    const parsed = quizSetupSchema.parse({});
    expect(parsed).toMatchObject({
      count: 10,
      mode: "normal",
      order: "random",
      timerSeconds: 20,
    });
  });

  it("rejects a count outside the allowed range", () => {
    expect(() => quizSetupSchema.parse({ count: 500 })).toThrow();
  });

  it("rejects an unknown mode", () => {
    expect(() => quizSetupSchema.parse({ mode: "insane" })).toThrow();
  });
});

describe("quizSetupFromSearchParams", () => {
  it("coerces string query-param values to numbers", () => {
    const parsed = quizSetupFromSearchParams({ count: "15" });
    expect(parsed.count).toBe(15);
  });

  it("takes the first value when a param repeats", () => {
    const parsed = quizSetupFromSearchParams({
      mode: ["chrono", "normal"],
    });
    expect(parsed.mode).toBe("chrono");
  });

  it("falls back to schema defaults for missing params", () => {
    const parsed = quizSetupFromSearchParams({});
    expect(parsed.count).toBe(10);
  });
});
