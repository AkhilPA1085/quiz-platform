import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../../../data/quizService";
import { useQuizStore } from "../../../store/quizStore";
import EmptyState from "../../../components/ui/EmptyState";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function LeaderboardPage() {
  const quizzes = useQuizStore((state) => state.database.quizzes);
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? "");

  const entries = useMemo(() => {
    if (!selectedQuizId) return [];

    return getLeaderboard(selectedQuizId, 10);
  }, [selectedQuizId]);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);

  return (
    <section className="page-container">
      <div className="page-heading">
        <p className="eyebrow">PERFORMANCE</p>
        <h1>Leaderboard</h1>
        <p className="page-description">
          See how participants performed in each quiz.
        </p>
      </div>

      <div className="filter-bar">
        <label htmlFor="leaderboard-quiz">Choose a quiz</label>
        <select
          id="leaderboard-quiz"
          value={selectedQuizId}
          onChange={(event) => setSelectedQuizId(event.target.value)}
        >
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>
      </div>

      {selectedQuiz && (
        <div className="leaderboard-summary">
          <h2>{selectedQuiz.title}</h2>
          <p>{entries.length} ranked attempt(s), showing up to 10.</p>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          title="No completed attempts yet"
          description="Complete this quiz to appear on the leaderboard."
          action={
            selectedQuizId ? (
              <Link className="primary-button" to={`/quiz/${selectedQuizId}`}>
                Take quiz
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="table-container">
          <table className="leaderboard-table">
            <caption className="visually-hidden">
              Rankings for {selectedQuiz?.title ?? "selected quiz"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Participant</th>
                <th scope="col">Score</th>
                <th scope="col">Percentage</th>
                <th scope="col">Time taken</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.userId + entry.completedAt}>
                  <td>
                    <strong>#{entry.rank}</strong>
                  </td>
                  <td>{entry.userName}</td>
                  <td>
                    {entry.score}/{entry.totalQuestions}
                  </td>
                  <td>{entry.percentage}%</td>
                  <td>{formatDuration(entry.timeTakenSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LeaderboardPage;
