import { beforeEach, describe, expect, it } from "vitest";
import {
  getCurrentQuestion,
  resetDatabase,
  startOrResumeAttempt,
  submitAnswer,
  completeAttempt,
  createQuiz,
  getQuiz,
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

    expect(() => submitAnswer(attempt.id, "invalid-question-id", [])).toThrow();
  });

  it("moves to the next question after submitting an answer", () => {
    const attempt = startOrResumeAttempt("q1", "u1");
    const current = getCurrentQuestion(attempt.id);

    expect(current).not.toBeNull();

    const next = submitAnswer(attempt.id, current!.question.id, []);

    expect(next).not.toBeNull();
    expect(next!.questionIndex).toBe(1);
  });

  it("rejects an answer containing an invalid option ID", () => {
    const attempt = startOrResumeAttempt("q1", "u1");
    const current = getCurrentQuestion(attempt.id);

    expect(current).not.toBeNull();

    expect(() =>
      submitAnswer(attempt.id, current!.question.id, ["invalid-option-id"]),
    ).toThrow();
  });

  it("awards a point for a correct answer", () => {
    const quiz = getQuiz("q1");
    const attempt = startOrResumeAttempt("q1", "u1");
    const current = getCurrentQuestion(attempt.id);

    expect(current).not.toBeNull();

    const question = quiz.questions.find(
      (item) => item.id === current!.question.id,
    );

    expect(question).toBeDefined();

    submitAnswer(attempt.id, current!.question.id, question!.correctOptionIds);

    const result = completeAttempt(attempt.id);

    expect(result.score).toBe(1);
    expect(result.correctCount).toBe(1);
  });

  it("resumes the existing in-progress attempt instead of creating another", () => {
    const firstAttempt = startOrResumeAttempt("q1", "u1");
    const resumedAttempt = startOrResumeAttempt("q1", "u1");

    expect(resumedAttempt.id).toBe(firstAttempt.id);
  });

  it("does not allow another attempt when retakes are disabled", () => {
    const quiz = createQuiz({
      title: "Retake Restriction Test",
      description: "Tests the retake restriction.",
      countries: ["IN"],
      timeLimitSeconds: null,
      perQuestionSeconds: null,
      retakesAllowed: false,
      questions: [
        {
          id: "retake-test-question",
          text: "Which option is correct?",
          type: "single",
          options: [
            { id: "option-a", text: "Option A" },
            { id: "option-b", text: "Option B" },
          ],
          correctOptionIds: ["option-a"],
        },
      ],
    });

    const attempt = startOrResumeAttempt(quiz.id, "u1");
    completeAttempt(attempt.id);

    expect(() => startOrResumeAttempt(quiz.id, "u1")).toThrow();
  });

  it("returns no score for an attempt completed without answering", () => {
    const attempt = startOrResumeAttempt("q1", "u1");

    const result = completeAttempt(attempt.id);

    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.incorrectCount).toBe(result.totalQuestions);
  });
});
