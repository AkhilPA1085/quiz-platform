import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import QuizListPage from "../features/quizzes/pages/QuizListPage";
import QuizTakingPage from "../features/quiz-taking/pages/QuizTakingPage";
import ResultPage from "../features/results/pages/ResultPage";
import LeaderboardPage from "../features/leaderboard/pages/LeaderboardPage";
import AdminQuizPage from "../features/quizzes/pages/AdminQuizPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: "quiz/:quizId", element: <QuizTakingPage /> },
      { path: "results/:attemptId", element: <ResultPage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "admin/quizzes", element: <AdminQuizPage /> },
    ],
  },
]);
