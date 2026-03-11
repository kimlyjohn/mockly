# Mockly

Mockly is a modern mock exam platform for importing custom exam JSON, taking timed attempts, and reviewing results with clear feedback.

It is designed for fast exam prep workflows with a polished dashboard, strong validation, and a complete attempt lifecycle.

## What This Project Does

- Imports and validates exam JSON files.
- Organizes exams in a library with pagination and management actions.
- Runs full attempt sessions with autosave, keyboard shortcuts, question flags, and submission flow.
- Grades attempts and shows detailed review per question.
- Supports app settings (theme, autosave interval, retry behavior, keyboard shortcuts).
- Includes backup export/import for exam and settings data portability.

## Creating Exam JSON with AI

Mockly includes an in-app AI Prompt Builder to help you generate valid exam JSON quickly.

1. Open the prompt builder in Mockly and copy the generated prompt.
2. Paste that prompt into an AI chatbot like ChatGPT, Gemini, or Claude.
3. Add the sources or reference material you want the mock exam to be based on.
4. The prompt already contains the required instructions, so no extra prompt text is needed.
5. Paste the JSON directly into Mockly or upload it as a `.json` file.

This flow makes it easy to go from source material to a playable mock exam in minutes.

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/Base UI components
- Prisma + PostgreSQL
- Vitest for unit tests

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env`:

```bash
DATABASE_URL="your_postgres_connection_string"
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint
- `npm run test:unit` - Run unit tests
- `npm run db:test` - Check database connectivity
- `npm run db:studio` - Open Prisma Studio

## Project Structure

- `app/(dashboard)` - Main dashboard pages (library, attempts, settings)
- `app/api` - REST API routes for exams, attempts, settings, backups
- `components` - UI and feature components
- `lib` - Core domain logic (schema, grading, mappers, runtime helpers)
- `prisma` - Schema and migrations
- `tests` - Unit tests

## Status

Mockly is actively developed and already provides a complete end-to-end exam workflow from import to review.
