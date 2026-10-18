
import { beforeEach, describe, expect, it } from "vitest";
import {
  getCurrentQuestion,
  resetDatabase,
  startOrResumeAttempt,
  submitAnswer,
} from "../../../data/quizService";

describe("quiz attempt service", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDatabase();
  });

  it("returns a question without exposing correct answers", () => {
    const attempt = startOrResumeAttempt("q1", "u1");
    const current = getCurrentQuestion(attempt.id);

    expect(current).not.toBeNull();
    expect(current?.question).toBeDefined();
    expect(current?.question).not.toHaveProperty("correctOptionIds");
  });

  it("persists a newly started attempt", () => {
    const attempt = startOrResumeAttempt("q1", "u1");

    const saved = JSON.parse(
      localStorage.getItem("quiz-platform-database") ?? "{}",
    ) as {
      attempts: Array<{ id: string; status: string }>;
    };

    expect(
      saved.attempts.some(
        (item) => item.id === attempt.id && item.status === "in_progress",
      ),
    ).toBe(true);
  });

  it("rejects an answer for a question that is not current", () => {
    const attempt = startOrResumeAttempt("q1", "u1");

    expect(() =>
      submitAnswer(attempt.id, "invalid-question-id", []),
    ).toThrow();
  });

  it("moves to the next question after submitting an answer", () => {
    const attempt = startOrResumeAttempt("q1", "u1");
    const current = getCurrentQuestion(attempt.id);

    expect(current).not.toBeNull();

    const next = submitAnswer(
      attempt.id,
      current!.question.id,
      [],
    );

    expect(next).not.toBeNull();
    expect(next!.questionIndex).toBe(1);
  });
});
