import { Link, Outlet } from "react-router-dom";
import "./App.css";
import { useQuizStore } from "./store/quizStore";

function App() {
  const database = useQuizStore((state) => state.database);
  const activeUserId = useQuizStore((state) => state.activeUserId);
  const selectedCountry = useQuizStore((state) => state.selectedCountry);
  const setActiveUser = useQuizStore((state) => state.setActiveUser);
  const setSelectedCountry = useQuizStore((state) => state.setSelectedCountry);
  const activeUser = database.users.find((user) => user.id === activeUserId);
  const isAdmin = activeUser?.role === "admin";
  const availableCountries = database.countries.filter((country) =>
    database.quizzes.some((quiz) => quiz.countries.includes(country.code)),
  );

  return (
    <div className="min-h-screen">
      <header>
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/" className="brand">
            Quiz Platform
          </Link>

          <div className="nav-links">
            <Link to="/">Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>

            {isAdmin && <Link to="/admin/quizzes">Manage Quizzes</Link>}
          </div>

          {activeUser && (
            <div className="header-controls">
              <div className="header-control">
                <select
                  id="active-user"
                  value={activeUserId}
                  onChange={(event) => setActiveUser(event.target.value)}
                >
                  {database.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                      {user.role === "admin" ? " (Admin)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="header-control">
                <select
                  id="country-filter"
                  value={selectedCountry}
                  onChange={(event) => setSelectedCountry(event.target.value)}
                >
                  <option value="">
                    ({activeUser.country})
                  </option>

                  {availableCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
