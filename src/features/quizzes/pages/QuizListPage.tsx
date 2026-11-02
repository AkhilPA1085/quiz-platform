import { Link } from "react-router-dom";
import { getQuizzes } from "../../../data/quizService";
import { useQuizStore } from "../../../store/quizStore";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import { useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";

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
  const [query, setQuery] = useState("");
  const searchQuery = useDebounce(query);

  const activeUser = database.users.find((user) => user.id === activeUserId);

  if (!activeUser) {
    return <p role="alert">Unable to find the selected user.</p>;
  }

  const effectiveCountry = selectedCountry || activeUser.country;

  const quizzes = getQuizzes(activeUserId, effectiveCountry);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const query = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(query) ||
      quiz.description.toLowerCase().includes(searchQuery)
    );
  });

  console.log("filteredQuizzes", filteredQuizzes);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  return (
    <section className="page-container">
      <div className="page-heading">
        <PageHeader
          eyebrow="LEARN • PRACTICE • IMPROVE"
          title="Available Quizzes"
          description="Choose a quiz and test your knowledge."
        />
      </div>

      <input
        placeholder="Search Quiz..."
        onChange={(e) => handleSearch(e.target.value)}
        value={query}
        className="search-field"
      />

      <div className="quiz-summary">
        <span>
          {filteredQuizzes.length}{" "}
          {filteredQuizzes.length === 1 ? "quiz" : "quizzes"} available
        </span>
        <span>
          Showing quizzes for{" "}
          {database.countries.find(
            (country) => country.code === effectiveCountry,
          )?.name ?? effectiveCountry}
        </span>
      </div>

      {filteredQuizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          description="There are no quizzes for this country. Try selecting another country."
        />
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
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

              <Link className="primary-button" to={`/quiz/details/${quiz.id}`}>
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
