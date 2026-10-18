import { Link } from "react-router-dom";
import { getQuizzes } from "../../../data/quizService";
import { useQuizStore } from "../../../store/quizStore";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";

function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return "No overall time limit";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function QuizListPage() {
  const database = useQuizStore((state) => state.database);
  const activeUserId = useQuizStore((state) => state.activeUserId);
  const selectedCountry = useQuizStore((state) => state.selectedCountry);
  const setActiveUser = useQuizStore((state) => state.setActiveUser);
  const setSelectedCountry = useQuizStore((state) => state.setSelectedCountry);

  const activeUser = database.users.find((user) => user.id === activeUserId);

  if (!activeUser) {
    return <p role="alert">Unable to find the selected user.</p>;
  }

  const effectiveCountry = selectedCountry || activeUser.country;

  const quizzes = getQuizzes(activeUserId, effectiveCountry);

  const availableCountries = database.countries.filter((country) =>
    database.quizzes.some((quiz) => quiz.countries.includes(country.code)),
  );

  return (
    <section className="page-container">
      <div className="page-heading">

        <PageHeader
          eyebrow="LEARN • PRACTICE • IMPROVE"
          title="Available Quizzes"
          description="Choose a quiz and test your knowledge."
        />

        <div className="filters">
          <label htmlFor="active-user">Current user</label>
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

          <label htmlFor="country-filter">Quiz country</label>
          <select
            id="country-filter"
            value={selectedCountry}
            onChange={(event) => setSelectedCountry(event.target.value)}
          >
            <option value="">User's country ({activeUser.country})</option>

            {availableCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="quiz-summary">
        <span>
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} available
        </span>
        <span>
          Showing quizzes for{" "}
          {database.countries.find(
            (country) => country.code === effectiveCountry,
          )?.name ?? effectiveCountry}
        </span>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          description="There are no quizzes for this country. Try selecting another country."
        />
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <Card className="quiz-card" key={quiz.id}>
              <div className="quiz-card-top">
                <span className="quiz-tag">{quiz.questionCount} questions</span>

                <Badge variant={quiz.completed ? "success" : "neutral"}>
                  {quiz.completed ? "Completed" : "Not completed"}
                </Badge>
              </div>

              <h2>{quiz.title}</h2>
              <p className="quiz-description">{quiz.description}</p>

              <div className="quiz-details">
                <div>
                  <span className="detail-label">Overall time</span>
                  <strong>{formatDuration(quiz.timeLimitSeconds)}</strong>
                </div>

                <div>
                  <span className="detail-label">Per question</span>
                  <strong>
                    {quiz.perQuestionSeconds === null
                      ? "No limit"
                      : `${quiz.perQuestionSeconds} sec`}
                  </strong>
                </div>

                <div>
                  <span className="detail-label">Retakes</span>
                  <strong>
                    {quiz.retakesAllowed ? "Allowed" : "Not allowed"}
                  </strong>
                </div>

                <div>
                  <span className="detail-label">Best score</span>
                  <strong>
                    {quiz.bestScore === null
                      ? "Not attempted"
                      : `${quiz.bestScore} / ${quiz.questionCount}`}
                  </strong>
                </div>
              </div>

              <Link className="primary-button" to={`/quiz/${quiz.id}`}>
                {quiz.completed ? "View quiz again" : "Start quiz"}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default QuizListPage;
