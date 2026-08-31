# Quizkit

A Next.js PWA quiz-app skeleton: one codebase, one config file per fork. Sign up, pick a category, take a quiz, earn medals — the whole golden path already runs. See [`docs/multi-domain-playbook.md`](./docs/multi-domain-playbook.md) for how to turn this into a different quiz app for a different field.

## Stack

| Layer         | Choice                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------- |
| Framework     | Next.js (App Router, TypeScript, Turbopack)                                              |
| Validation    | Zod — the source of truth for every input shape                                          |
| Server state  | TanStack Query (query-key factory in `features/*/queries.ts`)                            |
| Forms         | React Hook Form + `@hookform/resolvers/zod`                                              |
| Auth          | Better Auth (email/password), Prisma adapter                                             |
| Database      | SQLite locally via a Prisma driver adapter, swap to Postgres for prod                    |
| Testing       | Vitest + Testing Library (unit), Playwright (e2e)                                        |
| Lint/format   | ESLint + Prettier + Husky/lint-staged                                                    |
| UI            | Tailwind CSS v4 + shadcn/ui (components copied into `components/ui`, owned by this repo) |
| Observability | Sentry (off until `SENTRY_DSN` is set)                                                   |

## Quickstart

```bash
npm install
cp .env.example .env          # fill in BETTER_AUTH_SECRET at minimum
npm run db:migrate            # creates prisma/migrations + dev.db
npm run db:seed               # seeds 3 demo categories + questions
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/sign-up`. Create an account, take a quiz, check `/profile` for medals and streaks.

## Scripts

| Command                           | What it does                                         |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev`                     | Start the dev server                                 |
| `npm run build` / `npm run start` | Production build / serve                             |
| `npm run lint` / `lint:fix`       | ESLint                                               |
| `npm run format` / `format:check` | Prettier                                             |
| `npm run typecheck`               | `tsc --noEmit`                                       |
| `npm test` / `test:watch`         | Vitest                                               |
| `npm run test:e2e`                | Playwright (run `npx playwright install` once first) |
| `npm run db:migrate`              | Apply Prisma migrations (dev)                        |
| `npm run db:push`                 | Push schema without a migration file                 |
| `npm run db:seed`                 | Re-run `prisma/seed.ts`                              |
| `npm run db:studio`               | Prisma Studio, a GUI on the local database           |

## Project structure

```
app/                  routes only — thin wrappers around features/*
  (marketing)/        sign-in, sign-up — no bottom nav
  (app)/              everything behind auth — bottom nav shell
features/<name>/      components/ hooks/ schemas.ts/ queries.ts/ actions.ts
config/domain.config.ts   the one file a fork edits — see the playbook
lib/                  auth, db, session/permission helpers, quiz-engine (pure fns)
prisma/               schema.prisma, migrations, seed.ts
```

## What's built vs. stubbed

**Built and tested:** auth (sign up / sign in / sign out), profile + gamification (streaks, medals, points), category browser, quiz setup → play → grade → results, domain-config-driven theming, PWA manifest + a minimal service worker, RBAC via a permission map, ESLint/Prettier/Husky/Vitest/Playwright all wired and green.

**Stubbed, flagged in `domain.config.ts → features`:** duels, forum, courses, admin question CRUD/Excel import/AI generation. Each stub route explains what's missing and links back to the playbook's build order.

## Docs

- [`docs/multi-domain-playbook.md`](./docs/multi-domain-playbook.md) — how to fork this into a new quiz app for a new field, including what to do when one vertical needs more or fewer features than another.
