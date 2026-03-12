<h1 align="center">Mockly</h1>
<p align="center">A "Bring-Your-Own-AI" mock exam generator and player.</p>

## What is Mockly?

Mockly is a web application designed to turn your study materials into interactive mock exams.

Instead of dealing with expensive LLM API integrations, rate limits, or slow loading times, Mockly handles the AI generation externally. It generates a highly optimized system prompt that you paste into your favorite AI (ChatGPT, Gemini, Claude) along with your study notes. The AI spits out a strictly formatted JSON file, which Mockly then parses, saves to a database, and renders into a fully interactive exam environment.

It was built primarily as a pragmatic study tool for students to practice realistic test pressure and review their mistakes without manually writing out flashcards or questionnaires.

## The Core Workflow

1. **Build the Prompt:** Use Mockly's UI to select question types (Multiple Choice, True/False, Identification, etc.), passing score, and question counts. Mockly generates a strict prompt.
2. **Generate Externally:** Copy the prompt, paste it into an LLM alongside your PDFs/notes, and copy the resulting JSON.
3. **Import:** Paste the JSON into Mockly.
4. **Practice & Review:** Take the exam in a focused UI. Once submitted, Mockly grades it (handling fuzzy logic for text inputs) and displays pre-generated explanations for why answers were right or wrong.

## Main Features

- **Decoupled AI Architecture:** Zero API keys or ongoing costs required. Use whatever AI model is currently the smartest.
- **Smart Exam Player:** Full attempt runtime with progress tracking, question flagging, and timed sessions.
- **Exam Library:** Save imported JSON exams to your database to retake them anytime.
- **Attempt History:** Track your past scores and review exactly which questions you missed and why.

## Developer Setup

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL

### Run Locally

1. Install dependencies:

```bash
npm install

```

2. Configure environment variables in `.env`:

```bash
DATABASE_URL="your_runtime_database_url"
DIRECT_URL="your_direct_database_url"

```

For Supabase:

- `DATABASE_URL` should use the pooled connection (`:6543` with `?pgbouncer=true`) for app runtime, especially on Vercel/serverless.
- `DIRECT_URL` should use the direct connection (`:5432`) for Prisma migrations and schema operations.

If your password contains special characters (e.g. `@`, `#`, `%`), URL-encode them in both URLs.

3. Apply database migrations:

```bash
DIRECT_URL="your_direct_database_url" npx prisma migrate dev

```

4. Start development server:

```bash
npm run dev

```

Open http://localhost:3000 to view the app.

### Useful Commands

- `npm run dev` - start local dev server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run ESLint
- `npm run test:unit` - run unit tests
- `npm run db:test` - check database connectivity
- `npm run db:studio` - open Prisma Studio to view the database UI

### Project Architecture

- `app/(dashboard)` - Main application views (Library, Attempts, Import)
- `app/api` - Backend API routes for database interactions
- `components` - Modular UI components (Exam Player, Question Renderers)
- `lib` - Core domain logic, JSON validation (Zod), and grading utilities
- `prisma` - Database schema and migrations
