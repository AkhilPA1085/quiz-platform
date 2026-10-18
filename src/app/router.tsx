
import { Link, createBrowserRouter, useParams } from "react-router-dom";
import App from "../App";
import QuizListPage from "../features/quizzes/pages/QuizListPage";

function QuizTakingPlaceholder() {
  const { quizId } = useParams();

  return (
    <section className="page-container">
      <h1>Quiz coming next</h1>
      <p>
        Quiz ID: <strong>{quizId}</strong>
      </p>
      <p>
        The quiz-taking flow will be implemented in the next step.
      </p>
      <Link to="/">Back to quizzes</Link>
    </section>
  );
}

function LeaderboardPage() {
  return (
    <section className="page-container">
      <h1>Leaderboard</h1>
      <p>Quiz rankings will appear here.</p>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <QuizListPage />,
      },
      {
        path: "quiz/:quizId",
        element: <QuizTakingPlaceholder />,
      },
      {
        path: "leaderboard",
        element: <LeaderboardPage />,
      },
    ],
  },
]);
