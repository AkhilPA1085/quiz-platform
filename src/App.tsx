import { Link, Outlet } from "react-router-dom";
import "./App.css";
import { useQuizStore } from "./store/quizStore";

function App() {
  const isAdmin = useQuizStore(
    (state) =>
      state.database.users.find((user) => user.id === state.activeUserId)
        ?.role === "admin",
  );
  return (
    <div className="min-h-screen">
      <header>
        <nav aria-label="Main navigation">
          <Link to="/" className="brand">
            Quiz Platform
          </Link>

          <div className="nav-links">
            <Link to="/">Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>

            {isAdmin && <Link to="/admin/quizzes">Manage Quizzes</Link>}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
