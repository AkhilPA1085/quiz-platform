# React Quiz Platform

A client-side quiz application built with React, TypeScript, and Vite. Users can browse quizzes, take or resume attempts, view results, and compare completed attempts on quiz leaderboards. The seeded admin user can create, edit, and delete quizzes.

## Features

### Quiz browsing and management

- Browse quizzes and filter the list by country.
- Switch between seeded users to try the application with different user roles and countries.
- Create, edit, and delete quizzes as the seeded admin user.
- Configure quiz availability by country, single-select or multiple-select questions, answer options, correct answers, retake permissions, and optional overall and per-question time limits.
- Validate required quiz fields, question content, answer options, correct answers, and timer values before saving.

### Taking quizzes

- Answer single-select and multiple-select questions in a one-question-at-a-time flow.
- Use an overall quiz timer, a per-question timer, both, or neither.
- Resume an in-progress attempt after refreshing the page.
- When a per-question timer expires, record the question as unanswered and continue. When the overall timer expires, finish the attempt.
- The question returned to the quiz interface contains question text and options, but not the correct-answer IDs.

### Results and leaderboard

- View the score, percentage, correct count, incorrect or unanswered count, and time taken for a completed attempt.
- Track completion and best score separately for each user and quiz.
- View a quiz leaderboard ranked by score, with faster completion time breaking ties. The leaderboard displays up to 10 completed attempts.

### Persistence

- Initialize quiz data from `src/data/seed.json` when there is no saved database.
- Store quizzes, attempts, and results in browser `localStorage`.
- Persist the selected user and country filter across page refreshes.

## Tech stack

- React and TypeScript
- Vite
- React Router
- Zustand
- CSS
- Vitest and React Testing Library

## Getting started

### Prerequisites

- Node.js (a recent LTS version is recommended)
- npm

### Installation

Clone the repository and enter the project directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd quiz-platform
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the project and create a production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run preview` | Preview the production build locally |

## Application structure

```text
src/
├── app/
│   └── router.tsx
├── data/
│   ├── seed.json
│   └── quizService.ts
├── features/
│   ├── leaderboard/
│   ├── quiz-taking/
│   ├── quizzes/
│   └── results/
├── store/
│   └── quizStore.ts
├── types/
│   └── quiz.ts
├── App.tsx
├── App.css
└── index.css
```

- `src/data/quizService.ts` contains quiz persistence, quiz management, attempt handling, scoring, and leaderboard calculations.
- `src/store/quizStore.ts` uses Zustand for application state and persists the selected user and country filter.
- `src/features/` contains the quiz list and admin pages, quiz-taking flow, results page, and leaderboard page.
- `src/data/seed.json` provides the initial countries, users, quizzes, and attempts.

## Seeded users and administration

The app starts with seeded users. Change the current user from the quiz list to explore the different user roles. The seeded admin user can access the quiz management page; this is a client-side role simulation, not authentication or server-side authorization.

## Limitations

- There is no backend or external API. Data is local to the current browser and is not synchronized across devices.
- Clearing the browser's local storage removes saved quiz data and preferences. Initial quiz data is loaded again when the application next initializes its database.
- Answer hiding is a UI/service boundary only. Correct answers are present in the client-side database, so this is not a security mechanism.
- The seeded user selector simulates user identity; it does not provide authentication.
- Results show score summaries, not a per-question review of selected and correct answers.
