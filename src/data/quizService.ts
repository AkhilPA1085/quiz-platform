import seedData from "./seed.json";
import type {
  CreateQuizInput,
  Quiz,
  QuizDatabase,
  QuizSummary,
  UpdateQuizInput,
  AttemptResult,
  CurrentQuestion,
  LeaderboardEntry,
  QuizAttempt,
} from "../types/quiz";

const STORAGE_KEY = "quiz-platform-database";

const initialDatabase = seedData as QuizDatabase;

function cloneDatabase(database: QuizDatabase): QuizDatabase {
  return structuredClone(database);
}

function readDatabase(): QuizDatabase {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved) as QuizDatabase;
    }
  } catch {
    // Invalid or inaccessible storage: restore the supplied seed.
  }

  const freshDatabase = cloneDatabase(initialDatabase);
  writeDatabase(freshDatabase);
  return freshDatabase;
}

function writeDatabase(database: QuizDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function getDatabase(): QuizDatabase {
  return cloneDatabase(readDatabase());
}

export function resetDatabase(): QuizDatabase {
  const freshDatabase = cloneDatabase(initialDatabase);
  writeDatabase(freshDatabase);
  return cloneDatabase(freshDatabase);
}

export function getQuizzes(userId: string, country?: string): QuizSummary[] {
  const database = readDatabase();
  const user = database.users.find((item) => item.id === userId);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const countryFilter = country || user.country;

  return database.quizzes
    .filter((quiz) => quiz.countries.includes(countryFilter))
    .map((quiz) => {
      const completedAttempts = database.attempts.filter(
        (attempt) =>
          attempt.quizId === quiz.id &&
          attempt.userId === userId &&
          attempt.status === "completed",
      );

      const bestScore = completedAttempts.reduce<number | null>(
        (best, attempt) =>
          best === null || (attempt.score ?? 0) > best
            ? (attempt.score ?? 0)
            : best,
        null,
      );

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions.length,
        timeLimitSeconds: quiz.timeLimitSeconds,
        perQuestionSeconds: quiz.perQuestionSeconds,
        retakesAllowed: quiz.retakesAllowed,
        completed: completedAttempts.length > 0,
        bestScore,
      };
    });
}

export function getQuiz(quizId: string): Quiz {
  const database = readDatabase();
  const quiz = database.quizzes.find((item) => item.id === quizId);

  if (!quiz) {
    throw new Error(`Quiz not found: ${quizId}`);
  }

  return quiz;
}

export function createQuiz(input: CreateQuizInput): Quiz {
  const database = readDatabase();

  const quiz: Quiz = {
    ...input,
    id: crypto.randomUUID(),
  };

  database.quizzes.push(quiz);
  writeDatabase(database);

  return quiz;
}

export function updateQuiz(quizId: string, input: UpdateQuizInput): Quiz {
  const database = readDatabase();
  const index = database.quizzes.findIndex((item) => item.id === quizId);

  if (index === -1) {
    throw new Error(`Quiz not found: ${quizId}`);
  }

  const updatedQuiz: Quiz = {
    ...database.quizzes[index],
    ...input,
    id: quizId,
  };

  database.quizzes[index] = updatedQuiz;
  writeDatabase(database);

  return updatedQuiz;
}

export function deleteQuiz(quizId: string): void {
  const database = readDatabase();
  const quizExists = database.quizzes.some((quiz) => quiz.id === quizId);

  if (!quizExists) {
    throw new Error(`Quiz not found: ${quizId}`);
  }

  database.quizzes = database.quizzes.filter((quiz) => quiz.id !== quizId);

  writeDatabase(database);
}

function getQuestionStartedAt(attempt: QuizAttempt): number {
  const lastAnswer = attempt.answers.at(-1);
  const timestamp = lastAnswer?.answeredAt ?? attempt.startedAt;

  return new Date(timestamp).getTime();
}

function getElapsedSeconds(startedAt: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
}

function calculateResult(
  attempt: QuizAttempt,
  completedAt: string,
): AttemptResult {
  const score = attempt.answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = attempt.totalQuestions;
  const timeTakenSeconds = getElapsedSeconds(
    attempt.startedAt,
    new Date(completedAt).getTime(),
  );

  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    userId: attempt.userId,
    score,
    totalQuestions,
    percentage:
      totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100),
    correctCount: score,
    incorrectCount: totalQuestions - score,
    timeTakenSeconds,
    completedAt,
  };
}

function finishAttempt(
  database: QuizDatabase,
  attempt: QuizAttempt,
  completedAt = new Date().toISOString(),
): AttemptResult {
  const result = calculateResult(attempt, completedAt);

  attempt.status = "completed";
  attempt.completedAt = result.completedAt;
  attempt.score = result.score;
  attempt.percentage = result.percentage;
  attempt.timeTakenSeconds = result.timeTakenSeconds;

  writeDatabase(database);

  return result;
}


export function startOrResumeAttempt(
  quizId: string,
  userId: string,
): QuizAttempt {
  const database = readDatabase();

  const quiz = database.quizzes.find((item) => item.id === quizId);
  if (!quiz) {
    throw new Error(`Quiz not found: ${quizId}`);
  }

  const user = database.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error("User not found.");
  }

  if (!quiz.countries.includes(user.country)) {
    throw new Error("This quiz is not available in the user's country.");
  }

  const existingAttempt = database.attempts.find(
    (attempt) =>
      attempt.quizId === quizId &&
      attempt.userId === userId &&
      attempt.status === "in_progress",
  );

  if (existingAttempt) {
    if (
      quiz.timeLimitSeconds !== null &&
      getElapsedSeconds(existingAttempt.startedAt) >= quiz.timeLimitSeconds
    ) {
      finishAttempt(database, existingAttempt);
      throw new Error("This attempt has expired.");
    }

    return existingAttempt;
  }

  const completedAttempts = database.attempts.filter(
    (attempt) =>
      attempt.quizId === quizId &&
      attempt.userId === userId &&
      attempt.status === "completed",
  );

  if (completedAttempts.length > 0 && !quiz.retakesAllowed) {
    throw new Error("Retakes are not allowed for this quiz.");
  }

  const attempt: QuizAttempt = {
    id: crypto.randomUUID(),
    quizId,
    userId,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    currentQuestionIndex: 0,
    answers: [],
    completedAt: null,
    score: null,
    percentage: null,
    timeTakenSeconds: null,
    totalQuestions: quiz.questions.length,
  };

  database.attempts.push(attempt);
  writeDatabase(database);

  return attempt;
}


export function getCurrentQuestion(attemptId: string): CurrentQuestion | null {
  const database = readDatabase();

  const attempt = database.attempts.find((item) => item.id === attemptId);

  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`);
  }

  if (attempt.status !== "in_progress") {
    return null;
  }

  const quiz = database.quizzes.find((item) => item.id === attempt.quizId);

  if (!quiz) {
    throw new Error("The quiz was deleted during this attempt.");
  }

  const now = Date.now();

  if (
    quiz.timeLimitSeconds !== null &&
    getElapsedSeconds(attempt.startedAt, now) >= quiz.timeLimitSeconds
  ) {
    finishAttempt(database, attempt, new Date(now).toISOString());
    return null;
  }

  const question = quiz.questions[attempt.currentQuestionIndex];

  if (!question) {
    finishAttempt(database, attempt, new Date(now).toISOString());
    return null;
  }

  const questionStartedAt = getQuestionStartedAt(attempt);
  const questionElapsed = getElapsedSeconds(
    new Date(questionStartedAt).toISOString(),
    now,
  );

  if (
    quiz.perQuestionSeconds !== null &&
    questionElapsed >= quiz.perQuestionSeconds
  ) {
    // Time expired without an answer. Record an empty answer and move on.
    attempt.answers.push({
      questionId: question.id,
      selectedOptionIds: [],
      isCorrect: false,
      answeredAt: new Date(now).toISOString(),
    });

    attempt.currentQuestionIndex += 1;

    if (attempt.currentQuestionIndex >= quiz.questions.length) {
      finishAttempt(database, attempt, new Date(now).toISOString());
      return null;
    }

    writeDatabase(database);

    // Return the next question, without its correct answers.
    return getCurrentQuestion(attemptId);
  }

  const overallRemaining =
    quiz.timeLimitSeconds === null
      ? null
      : Math.max(
          0,
          quiz.timeLimitSeconds - getElapsedSeconds(attempt.startedAt, now),
        );

  const questionRemaining =
    quiz.perQuestionSeconds === null
      ? null
      : Math.max(0, quiz.perQuestionSeconds - questionElapsed);

  const remainingSeconds =
    overallRemaining === null
      ? questionRemaining
      : questionRemaining === null
        ? overallRemaining
        : Math.min(overallRemaining, questionRemaining);

  return {
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      options: question.options,
    },
    questionIndex: attempt.currentQuestionIndex,
    totalQuestions: quiz.questions.length,
    remainingSeconds,
  };
}

export function submitAnswer(
  attemptId: string,
  questionId: string,
  optionIds: string[],
): CurrentQuestion | null {
  const database = readDatabase();

  const attempt = database.attempts.find((item) => item.id === attemptId);

  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`);
  }

  if (attempt.status !== "in_progress") {
    throw new Error("This attempt is already completed.");
  }

  const quiz = database.quizzes.find((item) => item.id === attempt.quizId);

  if (!quiz) {
    throw new Error("The quiz was deleted during this attempt.");
  }

  const question = quiz.questions[attempt.currentQuestionIndex];

  if (!question || question.id !== questionId) {
    throw new Error("This is not the current question.");
  }

  if (attempt.answers.some((answer) => answer.questionId === questionId)) {
    throw new Error("This question has already been answered.");
  }

  const now = Date.now();
  const overallExpired =
    quiz.timeLimitSeconds !== null &&
    getElapsedSeconds(attempt.startedAt, now) >= quiz.timeLimitSeconds;

  const questionExpired =
    quiz.perQuestionSeconds !== null &&
    getElapsedSeconds(
      new Date(getQuestionStartedAt(attempt)).toISOString(),
      now,
    ) >= quiz.perQuestionSeconds;

  // Do not accept a late answer. Timeout behaves like an unanswered question.
  const acceptedOptionIds = overallExpired || questionExpired ? [] : optionIds;

  const validOptionIds = new Set(question.options.map((option) => option.id));

  if (acceptedOptionIds.some((id) => !validOptionIds.has(id))) {
    throw new Error("One or more selected options are invalid.");
  }

  if (question.type === "single" && acceptedOptionIds.length > 1) {
    throw new Error("Select only one option for this question.");
  }

  const selected = [...new Set(acceptedOptionIds)].sort();
  const correct = [...question.correctOptionIds].sort();

  attempt.answers.push({
    questionId,
    selectedOptionIds: selected,
    isCorrect:
      selected.length === correct.length &&
      selected.every((id, index) => id === correct[index]),
    answeredAt: new Date(now).toISOString(),
  });

  attempt.currentQuestionIndex += 1;

  if (overallExpired || attempt.currentQuestionIndex >= quiz.questions.length) {
    finishAttempt(database, attempt, new Date(now).toISOString());
    return null;
  }

  writeDatabase(database);
  return getCurrentQuestion(attemptId);
}

export function completeAttempt(attemptId: string): AttemptResult {
  const database = readDatabase();

  const attempt = database.attempts.find((item) => item.id === attemptId);

  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`);
  }

  if (attempt.status === "completed") {
    return calculateResult(
      attempt,
      attempt.completedAt ?? new Date().toISOString(),
    );
  }

  return finishAttempt(database, attempt);
}

export function getLeaderboard(quizId: string, limit = 10): LeaderboardEntry[] {
  const database = readDatabase();

  const quizExists = database.quizzes.some((quiz) => quiz.id === quizId);

  if (!quizExists) {
    throw new Error(`Quiz not found: ${quizId}`);
  }

  const completedAttempts = database.attempts
    .filter(
      (attempt) => attempt.quizId === quizId && attempt.status === "completed",
    )
    .map((attempt) => {
      const user = database.users.find((item) => item.id === attempt.userId);

      return {
        attempt,
        userName: user?.name ?? "Unknown user",
      };
    })
    .sort((a, b) => {
      const scoreDifference = (b.attempt.score ?? 0) - (a.attempt.score ?? 0);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return (
        (a.attempt.timeTakenSeconds ?? Number.MAX_SAFE_INTEGER) -
        (b.attempt.timeTakenSeconds ?? Number.MAX_SAFE_INTEGER)
      );
    });

  return completedAttempts
    .slice(0, Math.max(0, limit))
    .map(({ attempt, userName }, index) => ({
      rank: index + 1,
      userId: attempt.userId,
      userName,
      score: attempt.score ?? 0,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage ?? 0,
      timeTakenSeconds: attempt.timeTakenSeconds ?? 0,
      completedAt: attempt.completedAt ?? "",
    }));
}
