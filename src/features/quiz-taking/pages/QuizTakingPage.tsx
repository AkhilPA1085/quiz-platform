import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  completeAttempt,
  getCurrentQuestion,
  startOrResumeAttempt,
  submitAnswer,
} from "../../../data/quizService";
import { useQuizStore } from "../../../store/quizStore";
import type { CurrentQuestion } from "../../../types/quiz";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";

function QuizTakingPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const activeUserId = useQuizStore((state) => state.activeUserId);
  const refresh = useQuizStore((state) => state.refresh);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState<CurrentQuestion | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [displayedSeconds, setDisplayedSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!attemptId || !current || current.remainingSeconds === null) {
      setDisplayedSeconds(null);
      return;
    }

    const initialSeconds = current.remainingSeconds;
    const effectStartedAt = Date.now();
    let expiryHandled = false;

    setDisplayedSeconds(initialSeconds);

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - effectStartedAt) / 1000);
      const remaining = Math.max(0, initialSeconds - elapsedSeconds);

      setDisplayedSeconds(remaining);

      if (remaining > 0 || expiryHandled) return;

      expiryHandled = true;

      try {
        // The service determines whether the question or entire quiz expired.
        const nextQuestion = getCurrentQuestion(attemptId);

        refresh();

        if (nextQuestion === null) {
          completeAttempt(attemptId);
          refresh();
          navigate(`/results/${attemptId}`, { replace: true });
          return;
        }

        // The question timer expired; continue with the next question.
        setCurrent(nextQuestion);
        setSelectedOptionIds([]);
        setError(null);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to process the quiz timeout.",
        );
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [attemptId, current, navigate, refresh]);

  useEffect(() => {
    if (!quizId) {
      setError("A quiz ID was not provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    try {
      const attempt = startOrResumeAttempt(quizId, activeUserId);
      const question = getCurrentQuestion(attempt.id);

      if (cancelled) return;

      setAttemptId(attempt.id);

      if (question === null) {
        completeAttempt(attempt.id);
        refresh();
        navigate(`/results/${attempt.id}`, { replace: true });
        return;
      }

      setCurrent(question);
    } catch (err: unknown) {
      if (!cancelled) {
        setError(
          err instanceof Error ? err.message : "Unable to start this quiz.",
        );
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [quizId, activeUserId, navigate, refresh]);

  function toggleOption(optionId: string) {
    if (!current) return;

    if (current.question.type === "single") {
      setSelectedOptionIds([optionId]);
      return;
    }

    setSelectedOptionIds((previous) =>
      previous.includes(optionId)
        ? previous.filter((id) => id !== optionId)
        : [...previous, optionId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!attemptId || !current || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const nextQuestion = submitAnswer(
        attemptId,
        current.question.id,
        selectedOptionIds,
      );

      refresh();

      if (nextQuestion === null) {
        completeAttempt(attemptId);
        refresh();
        navigate(`/results/${attemptId}`, { replace: true });
        return;
      }

      setCurrent(nextQuestion);
      setSelectedOptionIds([]);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to submit your answer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="page-container">
        <p role="status">Loading quiz…</p>
      </section>
    );
  }

  if (error && !current) {
    return (
      <section className="page-container">
        <div className="empty-state error-state">
          <h1>Unable to open quiz</h1>
          <p role="alert">{error}</p>
          <Link className="primary-button" to="/">
            Back to quizzes
          </Link>
        </div>
      </section>
    );
  }

  if (!current) return null;

  const { question, questionIndex, totalQuestions } = current;

  return (
    <section className="page-container quiz-taking-page">
      <div className="question-header">

        <PageHeader
          eyebrow="QUIZ IN PROGRESS"
          title={`Question ${questionIndex + 1} of ${totalQuestions}`}
        />

        {displayedSeconds !== null && (
          <div className="timer" aria-live="polite">
            <span className="detail-label">Time remaining</span>
            <strong>
              {Math.floor(displayedSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :{(displayedSeconds % 60).toString().padStart(2, "0")}
            </strong>
          </div>
        )}
      </div>

      <div
        className="question-progress"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuenow={questionIndex + 1}
      >
        <div
          className="question-progress-fill"
          style={{
            width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      <form className="question-card" onSubmit={handleSubmit}>
        <p className="question-type">
          {question.type === "multiple"
            ? "Select all that apply"
            : "Select one answer"}
        </p>

        <h2>{question.text}</h2>

        <fieldset className="options-list">
          <legend className="visually-hidden">Answer options</legend>

          {question.options.map((option, index) => {
            const checked = selectedOptionIds.includes(option.id);
            const inputType = question.type === "single" ? "radio" : "checkbox";

            return (
              <label
                className={`option-row${checked ? " selected" : ""}`}
                key={option.id}
              >
                <input
                  type={inputType}
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={checked}
                  onChange={() => toggleOption(option.id)}
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option.text}</span>
              </label>
            );
          })}
        </fieldset>

        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}

        <div className="quiz-actions">
          <Link className="secondary-button" to="/">
            Exit quiz
          </Link>

          <Button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {" "}
            {submitting
              ? "Submitting…"
              : questionIndex === totalQuestions - 1
                ? "Submit quiz"
                : "Submit and continue"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export default QuizTakingPage;
