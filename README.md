# React Quiz Platform

A client-side quiz platform built with React, TypeScript, and Vite. Users can browse and attempt quizzes, resume in-progress attempts, view results and leaderboards, while administrators can create, edit, and delete quizzes.

## Features

### Quiz Management
- Browse quizzes available for the selected user's country.
- Filter quizzes by country.
- Create, edit, and delete quizzes.
- Configure quiz questions, answer options, retake permissions, and time limits.
- Validate quiz details before saving.

### Quiz Taking
- Answer single-select and multiple-select questions.
- Navigate through a one-question-at-a-time interface.
- Support overall quiz timers and per-question timers.
- Resume in-progress attempts after refreshing the page.
- Automatically handle expired attempts.
- Prevent correct answers from being exposed through the question interface before submission.

### Results and Leaderboard
- Display scores, percentages, correct answers, incorrect answers, and completion time.
- Track completion status and best scores independently for each user.
- Rank completed attempts by score, using faster completion time to break ties.

### Persistence
- Seed initial data from a local JSON file.
- Persist quiz data, attempts, and results in browser localStorage.
- Preserve selected-user preferences across page refreshes.
- Restore the original seed data using the Reset functionality.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand
- Zod
- Vitest
- React Testing Library
- HTML and CSS

## Getting Started

### Prerequisites

- Node.js (a recent LTS version is recommended)
- npm

### Installation

Clone the repository and enter the project directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd quiz-platform
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npx tsc -b` | Check TypeScript compilation |
| `npx vitest run` | Run automated tests |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |

## Architecture

The application separates UI components, application state, domain types, and data operations.

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

### Design Decisions

- **Service layer:** Quiz CRUD operations, attempt management, answer submission, scoring, and leaderboard calculations are handled outside UI components.
- **State management:** Zustand manages shared application state, including the active user and selected country.
- **Type safety:** TypeScript interfaces define the main domain entities and service contracts.
- **Validation:** Zod is used for schema validation where configured.
- **Persistence:** Browser storage keeps the application usable without a backend or external API.
- **Feature organization:** Quiz management, quiz taking, results, and leaderboards are organized into separate feature areas.

## Data and Limitations

This is a frontend-only application. It does not require a backend or external API.

- Data is stored in the current browser's localStorage and is not synchronized between devices.
- Clearing browser storage can remove saved progress.
- Client-side answer protection is not equivalent to server-side security; users can inspect browser data.
- Authentication and authorization are simulated through seeded users and roles.
- The leaderboard is based
