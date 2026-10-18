
import { Link, useParams } from "react-router-dom";
import { useQuizStore } from "../../../store/quizStore";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function ResultPage() {
  const { attemptId } = useParams();
  const database = useQuizStore((state) => state.database);

  const attempt = database.attempts.find(
    (item) => item.id === attemptId,
  );

  if (!attempt || attempt.status !== "completed") {
    return (
      <section className="page-container">
        <div className="empty-state">
          <h1>Results unavailable</h1>
          <p>We couldn't find a completed quiz attempt.</p>
          <Link className="primary-button" to="/">
            Back to quizzes
          </Link>
        </div>
      </section>
    );
  }

  const quiz = database.quizzes.find(
    (item) => item.id === attempt.quizId,
  );

  const user = database.users.find(
    (item) => item.id === attempt.userId,
  );

  const score = attempt.score ?? 0;
  const percentage = attempt.percentage ?? 0;
  const timeTaken = attempt.timeTakenSeconds ?? 0;

  return (
    <section className="page-container">
      <div className="result-card">
        <p className="eyebrow">QUIZ COMPLETED</p>
        <h1>Your results</h1>
        <p className="page-description">
          {quiz?.title ?? "Quiz"} · {user?.name ?? "User"}
        </p>

        <div className="result-score">
          <strong>{percentage}%</strong>
          <span>{score} out of {attempt.totalQuestions} correct</span>
        </div>

        <div className="result-stats">
          <div>
            <span className="detail-label">Correct answers</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span className="detail-label">Incorrect or unanswered</span>
            <strong>{attempt.totalQuestions - score}</strong>
          </div>
          <div>
            <span className="detail-label">Time taken</span>
            <strong>{formatDuration(timeTaken)}</strong>
          </div>
        </div>

        <Link className="primary-button" to="/">
          Back to quizzes
        </Link>
        <Link className="text-link" to="/leaderboard">
          View leaderboard
        </Link>
      </div>
    </section>
  );
}

export default ResultPage;
