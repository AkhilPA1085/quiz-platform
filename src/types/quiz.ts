
export type CountryCode = string;

export type UserRole = "user" | "admin";

export type QuestionType = "single" | "multiple";

export type AttemptStatus = "in_progress" | "completed";

export interface Country {
  code: CountryCode;
  name: string;
}

export interface User {
  id: string;
  name: string;
  country: CountryCode;
  role: UserRole;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: QuizOption[];
  correctOptionIds: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  countries: CountryCode[];
  timeLimitSeconds: number | null;
  perQuestionSeconds: number | null;
  retakesAllowed: boolean;
  questions: QuizQuestion[];
}

export interface AttemptAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  currentQuestionIndex: number;
  answers: AttemptAnswer[];
  completedAt: string | null;
  score: number | null;
  totalQuestions: number;
  percentage: number | null;
  timeTakenSeconds: number | null;
}

export interface SeedMeta {
  version: number;
  generatedAt: string;
  notes: string;
}

export interface QuizDatabase {
  meta: SeedMeta;
  countries: Country[];
  users: User[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}

/** Safe question shape for displaying a question before submission. */
export interface PublicQuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: QuizOption[];
}

export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimitSeconds: number | null;
  perQuestionSeconds: number | null;
  retakesAllowed: boolean;
  completed: boolean;
  bestScore: number | null;
}

export interface CurrentQuestion {
  question: PublicQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  remainingSeconds: number | null;
}

export interface AttemptResult {
  attemptId: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface CreateQuizInput {
  title: string;
  description: string;
  countries: CountryCode[];
  timeLimitSeconds: number | null;
  perQuestionSeconds: number | null;
  retakesAllowed: boolean;
  questions: QuizQuestion[];
}

export type UpdateQuizInput = Partial<CreateQuizInput>;
