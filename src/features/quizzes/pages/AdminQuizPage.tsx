import { useState, type FormEvent } from "react";
import { createQuiz, deleteQuiz, updateQuiz } from "../../../data/quizService";
import { useQuizStore } from "../../../store/quizStore";
import type {
  CreateQuizInput,
  Quiz,
  QuizQuestion,
  QuestionType,
} from "../../../types/quiz";

interface QuestionDraft {
  id: string;
  text: string;
  type: QuestionType;
  options: Array<{ id: string; text: string }>;
  correctOptionIds: string[];
}

const createQuestionDraft = (): QuestionDraft => ({
  id: crypto.randomUUID(),
  text: "",
  type: "single",
  options: [
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ],
  correctOptionIds: [],
});

function AdminQuizPage() {
  const database = useQuizStore((state) => state.database);
  const activeUserId = useQuizStore((state) => state.activeUserId);
  const refresh = useQuizStore((state) => state.refresh);

  const activeUser = database.users.find((user) => user.id === activeUserId);

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState("");
  const [perQuestionTime, setPerQuestionTime] = useState("");
  const [retakesAllowed, setRetakesAllowed] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    setEditingQuizId(null);
    setTitle("");
    setDescription("");
    setCountries([]);
    setTimeLimit("");
    setPerQuestionTime("");
    setRetakesAllowed(true);
    setQuestions([]);
    setError("");
    setSuccess("");
  }

  function editQuiz(quiz: Quiz) {
    setEditingQuizId(quiz.id);
    setTitle(quiz.title);
    setDescription(quiz.description);
    setCountries([...quiz.countries]);
    setTimeLimit(
      quiz.timeLimitSeconds === null ? "" : String(quiz.timeLimitSeconds),
    );
    setPerQuestionTime(
      quiz.perQuestionSeconds === null ? "" : String(quiz.perQuestionSeconds),
    );
    setRetakesAllowed(quiz.retakesAllowed);
    setQuestions(
      quiz.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options.map((option) => ({ ...option })),
        correctOptionIds: [...question.correctOptionIds],
      })),
    );
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateQuestion(
    questionIndex: number,
    changes: Partial<QuestionDraft>,
  ) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, ...changes } : question,
      ),
    );
  }

  function updateOption(questionIndex: number, optionId: string, text: string) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, text } : option,
              ),
            }
          : question,
      ),
    );
  }

  function toggleCorrectOption(
    questionIndex: number,
    optionId: string,
    checked: boolean,
  ) {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;

        const correctOptionIds =
          question.type === "single"
            ? checked
              ? [optionId]
              : []
            : checked
              ? [...question.correctOptionIds, optionId]
              : question.correctOptionIds.filter((id) => id !== optionId);

        return { ...question, correctOptionIds };
      }),
    );
  }

  function removeQuestion(questionIndex: number) {
    setQuestions((current) =>
      current.filter((_, index) => index !== questionIndex),
    );
  }

  function removeOption(questionIndex: number, optionId: string) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.filter(
                (option) => option.id !== optionId,
              ),
              correctOptionIds: question.correctOptionIds.filter(
                (id) => id !== optionId,
              ),
            }
          : question,
      ),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Enter both a quiz title and description.");
      return;
    }

    if (countries.length === 0) {
      setError("Select at least one country.");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    for (const [index, question] of questions.entries()) {
      if (!question.text.trim()) {
        setError(`Enter the text for question ${index + 1}.`);
        return;
      }

      if (
        question.options.length < 2 ||
        question.options.some((option) => !option.text.trim())
      ) {
        setError(`Question ${index + 1} needs at least two non-empty options.`);
        return;
      }

      if (question.correctOptionIds.length === 0) {
        setError(`Select a correct answer for question ${index + 1}.`);
        return;
      }

      const optionIds = new Set(question.options.map((option) => option.id));

      if (question.correctOptionIds.some((id) => !optionIds.has(id))) {
        setError(`Question ${index + 1} has an invalid correct answer.`);
        return;
      }

      if (
        question.type === "single" &&
        question.correctOptionIds.length !== 1
      ) {
        setError(`Question ${index + 1} must have exactly one correct answer.`);
        return;
      }
    }

    const input: CreateQuizInput = {
      title: title.trim(),
      description: description.trim(),
      countries,
      timeLimitSeconds: timeLimit === "" ? null : Number(timeLimit),
      perQuestionSeconds:
        perQuestionTime === "" ? null : Number(perQuestionTime),
      retakesAllowed,
      questions: questions.map(
        (question): QuizQuestion => ({
          id: question.id,
          text: question.text.trim(),
          type: question.type,
          options: question.options.map((option) => ({
            ...option,
            text: option.text.trim(),
          })),
          correctOptionIds: [...question.correctOptionIds],
        }),
      ),
    };

    if (
      (input.timeLimitSeconds !== null &&
        (!Number.isFinite(input.timeLimitSeconds) ||
          input.timeLimitSeconds <= 0)) ||
      (input.perQuestionSeconds !== null &&
        (!Number.isFinite(input.perQuestionSeconds) ||
          input.perQuestionSeconds <= 0))
    ) {
      setError("Timer values must be positive numbers of seconds.");
      return;
    }

    try {
      let message: string;

      if (editingQuizId) {
        updateQuiz(editingQuizId, input);
        message = "Quiz updated successfully.";
      } else {
        createQuiz(input);
        message = "Quiz created successfully.";
      }

      refresh();
      resetForm();
      setSuccess(message);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to save this quiz.",
      );
    }
  }

  function handleDelete(quiz: Quiz) {
    const confirmed = window.confirm(
      `Delete "${quiz.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      deleteQuiz(quiz.id);
      refresh();

      if (editingQuizId === quiz.id) {
        resetForm();
      }

      setError("");
      setSuccess(`"${quiz.title}" was deleted.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this quiz.",
      );
    }
  }

  if (activeUser?.role !== "admin") {
    return (
      <section className="page-container">
        <div className="empty-state">
          <h1>Access restricted</h1>
          <p>Select the Admin User from the quiz list to manage quizzes.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container admin-page">
      <div className="page-heading">
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Manage quizzes</h1>
        <p className="page-description">
          Create quizzes, manage questions and update existing content.
        </p>
      </div>

      {error && (
        <p className="admin-message error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="admin-message success" role="status">
          {success}
        </p>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingQuizId ? "Edit quiz" : "Create a quiz"}</h2>

        <label htmlFor="quiz-title">Quiz title</label>
        <input
          id="quiz-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <label htmlFor="quiz-description">Description</label>
        <textarea
          id="quiz-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <fieldset className="country-fieldset">
          <legend>Available countries</legend>
          <div className="admin-country-options">
            {database.countries.map((country) => (
              <label key={country.code}>
                <input
                  type="checkbox"
                  checked={countries.includes(country.code)}
                  onChange={(event) =>
                    setCountries((current) =>
                      event.target.checked
                        ? [...current, country.code]
                        : current.filter((code) => code !== country.code),
                    )
                  }
                />
                {country.name} ({country.code})
              </label>
            ))}
          </div>
        </fieldset>

        <div className="admin-timer-fields">
          <div>
            <label htmlFor="overall-time">Overall time limit (seconds)</label>
            <input
              id="overall-time"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(event) => setTimeLimit(event.target.value)}
              placeholder="No overall limit"
            />
          </div>
          <div>
            <label htmlFor="question-time">
              Per-question time limit (seconds)
            </label>
            <input
              id="question-time"
              type="number"
              min="1"
              value={perQuestionTime}
              onChange={(event) => setPerQuestionTime(event.target.value)}
              placeholder="No per-question limit"
            />
          </div>
        </div>

        <label className="admin-inline-label">
          <input
            type="checkbox"
            checked={retakesAllowed}
            onChange={(event) => setRetakesAllowed(event.target.checked)}
          />
          Allow retakes
        </label>

        <div className="admin-questions-heading">
          <h2>Questions ({questions.length})</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setQuestions((current) => [...current, createQuestionDraft()])
            }
          >
            Add question
          </button>
        </div>

        {questions.map((question, questionIndex) => (
          <fieldset className="question-editor" key={question.id}>
            <legend>Question {questionIndex + 1}</legend>

            <label htmlFor={`question-text-${questionIndex}`}>
              Question text
            </label>
            <textarea
              id={`question-text-${questionIndex}`}
              rows={2}
              value={question.text}
              onChange={(event) =>
                updateQuestion(questionIndex, { text: event.target.value })
              }
              required
            />

            <label htmlFor={`question-type-${questionIndex}`}>
              Answer type
            </label>
            <select
              id={`question-type-${questionIndex}`}
              value={question.type}
              onChange={(event) => {
                const value = event.target.value;

                if (value !== "single" && value !== "multiple") {
                  return;
                }

                const type: QuestionType = value;
                updateQuestion(questionIndex, {
                  type,
                  correctOptionIds:
                    type === "single"
                      ? question.correctOptionIds.slice(0, 1)
                      : question.correctOptionIds,
                });
              }}
            >
              <option value="single">Single correct answer</option>
              <option value="multiple">Multiple correct answers</option>
            </select>

            <p className="detail-label">
              Enter options and select the correct answer(s).
            </p>

            {question.options.map((option, optionIndex) => (
              <div className="admin-option-row" key={option.id}>
                <label className="admin-correct-option" title="Mark as correct">
                  <input
                    type={question.type === "single" ? "radio" : "checkbox"}
                    name={`correct-${questionIndex}`}
                    checked={question.correctOptionIds.includes(option.id)}
                    onChange={(event) =>
                      toggleCorrectOption(
                        questionIndex,
                        option.id,
                        event.target.checked,
                      )
                    }
                    aria-label={`Option ${optionIndex + 1} is correct`}
                  />
                </label>

                <input
                  aria-label={`Question ${questionIndex + 1}, option ${optionIndex + 1}`}
                  value={option.text}
                  onChange={(event) =>
                    updateOption(questionIndex, option.id, event.target.value)
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  required
                />

                <button
                  type="button"
                  className="remove-option-button"
                  disabled={question.options.length <= 2}
                  onClick={() => removeOption(questionIndex, option.id)}
                  aria-label={`Remove option ${optionIndex + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="question-editor-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  updateQuestion(questionIndex, {
                    options: [
                      ...question.options,
                      { id: crypto.randomUUID(), text: "" },
                    ],
                  })
                }
              >
                Add option
              </button>
              <button
                type="button"
                className="remove-question-button"
                onClick={() => removeQuestion(questionIndex)}
              >
                Remove question
              </button>
            </div>
          </fieldset>
        ))}

        <div className="admin-form-actions">
          <button type="submit" className="primary-button">
            {editingQuizId ? "Save changes" : "Create quiz"}
          </button>
          {editingQuizId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <div className="admin-quiz-list">
        <h2>Existing quizzes ({database.quizzes.length})</h2>

        {database.quizzes.length === 0 ? (
          <p>No quizzes have been created yet.</p>
        ) : (
          database.quizzes.map((quiz) => (
            <article className="admin-quiz-row" key={quiz.id}>
              <div>
                <h3>{quiz.title}</h3>
                <p>
                  {quiz.questions.length} questions ·{" "}
                  {quiz.countries.join(", ")}
                </p>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => editQuiz(quiz)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="remove-question-button"
                  onClick={() => handleDelete(quiz)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminQuizPage;
