import { Link, Outlet } from "react-router-dom";
import "./App.css";

function App() {
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
