import PageHeader from "../../../components/ui/PageHeader";
import { useQuizStore } from "../../../store/quizStore";
import { getQuiz, getQuizzes } from "../../../data/quizService";
import { Link, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { useEffect, useState } from "react";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

const QuizDescriptionPage = () => {
  const { quizId } = useParams();
  const database = useQuizStore((state) => state.database);
  const activeUserId = useQuizStore((state) => state.activeUserId);
  const selectedCountry = useQuizStore((state) => state.selectedCountry);

  const activeUser = database.users.find((user) => user.id === activeUserId);
  const [selectedQuiz, setSelectedQuiz] = useState({});

  if (!activeUser) {
    return <p role="alert">Unable to find the selected user.</p>;
  }

  const effectiveCountry = selectedCountry || activeUser.country;

  const quizzes = getQuizzes(activeUserId, effectiveCountry);
  const quiz = quizzes.find((item)=>item.id === quizId)

  console.log("quizData",quiz);

  return (
    <section className="page-container">
      <div className="page-heading">
        <PageHeader
          eyebrow="LEARN • PRACTICE • IMPROVE"
          title="Available Quizzes"
          description="Choose a quiz and test your knowledge."
        />
      </div>

      <Card className="quiz-card" key={quiz?.id}>

        <h2>{quiz?.title}</h2>
        <p className="quiz-description">{quiz?.description}</p>

        <div className="quiz-details">
          <div>
            <span className="detail-label">Overall time</span>
            {/* <strong>{formatDuration(quiz?.timeLimitSeconds)}</strong> */}
          </div>

          <div>
            <span className="detail-label">Retakes</span>
            <strong>{quiz?.retakesAllowed ? "Allowed" : "Not allowed"}</strong>
          </div>
        </div>
      </Card>

      <Link className="primary-button" to={`/quiz/${quiz?.id}`}>
        Start
      </Link>
      
    </section>
  );
};

export default QuizDescriptionPage;
