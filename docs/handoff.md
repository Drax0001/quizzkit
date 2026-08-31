# Handoff

Point-in-time snapshot written by Claude Code on **2026-08-31**, right after scaffolding this repo in one session. If you're a fresh Claude Code instance starting here: this document tells you what existed and was verified _at that moment_. Don't trust it blindly — re-run the verification commands in §3 and check `git log` / `git status` before acting on anything time-sensitive here. Update or delete this file once it's served its purpose; it's a handoff note, not a living doc.

## 1. What this repo is

**Quizkit** — a Next.js PWA quiz-app skeleton, config-driven so it can be forked into a differently-branded, differently-featured quiz app for any field (education, health, beauty, corporate training, ...). Full context:

- `README.md` — stack, quickstart, scripts, project structure.
- `docs/multi-domain-playbook.md` — how to fork this for a new vertical, and specifically how to handle each vertical needing a different feature set.
- The original architecture/planning doc — a Claude Artifact from the conversation that preceded this scaffold, titled "Quizkit — Architecture & Playbook": https://claude.ai/code/artifact/8a6cf4c0-f615-4ffb-af35-c8943c18e864 (not a file in this repo; ask the user for it if the link above 404s, artifact URLs can change ownership).

**Where this came from:** it was derived by auditing a separate, unrelated project — `cca-quiz`, a Vite/React/Base44 bank-training quiz app (a completely different codebase, different stack, different repo). That audit informed the _shape_ of this skeleton (entity model, gamification mechanics, mobile shell), but this repo shares no code with it and depends on nothing from it. Treat `cca-quiz` as unrelated prior art, not a sibling to keep in sync with, unless the user says otherwise.

**Why this doc exists:** the user is moving their primary working session from `cca-quiz` to this repo. This file is so a cold Claude Code instance starting here doesn't have to re-derive context that already exists in a conversation this repo's filesystem can't see.

## 2. Repo state as of this writing

- `git init` has been run. **Nothing is committed.** 32 untracked top-level entries (`git status --short`). The user has not asked for a commit yet — don't create one unprompted.
- Local SQLite dev database exists (`dev.db`, gitignored) with the seed data applied plus at least one smoke-test user (`smoke-test@example.com`) created while verifying the auth flow. Harmless to keep, harmless to reset (`rm dev.db && npm run db:migrate && npm run db:seed`).

## 3. Verification performed (all passed at handoff time)

```bash
npm run typecheck   # tsc --noEmit — clean
npm run lint         # eslint . — clean
npm run build         # next build — all 14 routes compiled
npm test               # vitest run — 14/14 passing
npm run format:check    # prettier --check . — clean
```

Beyond static checks, the golden path was smoke-tested against a real running `next start` server via curl: sign-up (`POST /api/auth/sign-up/email`) returned a session; the authenticated home page rendered seeded categories and auto-created the user's `Profile` row; `/quiz/setup` and `/quiz/play?...` returned 200 with real content; `/admin` correctly 307-redirected a non-privileged user away. This was genuinely exercised, not just assumed from the build passing.

Playwright (`npm run test:e2e`) was **not** run — it needs `npx playwright install` first, which wasn't done to save time. The test file exists (`tests/e2e/sign-in.spec.ts`) and the config is in place; running it is a reasonable first thing to do in a new session if you want extra confidence.

## 4. Built and working end-to-end

Auth (sign up/in/out via Better Auth), Profile with gamification (streaks, medals, points — pure logic in `lib/quiz-engine.ts`, unit-tested), category browser, the full quiz loop (setup → play with instant per-question server-graded feedback → server-recomputed scoring on submit → results), domain-config-driven theming (`config/domain.config.ts` → CSS custom properties via `components/theme-tokens.tsx`), a PWA manifest + minimal hand-rolled service worker, and RBAC via a permission map (`lib/session.ts`) with a config-driven owner allowlist (no hardcoded emails).

## 5. Feature parity vs. cca-quiz — the actual goal

**The target is full feature parity with the original `cca-quiz` app, ported into this skeleton's generic, config-driven shape — not a permanently-partial "core + stubs" product.** Section 4 above is what's done; everything below is backlog, not a deliberate scope cut. Treat this table as the source of truth for what "finished" means, and update it as items move between columns.

Status legend: **Built** = real UI + Server Actions, exercised and working. **Backend only** = the Prisma model and/or Server Action exists, but there is no UI calling it — don't assume "the model exists" means "the feature works." **Stub** = a flagged route with a placeholder page. **Not started** = nothing exists yet.

| cca-quiz feature                            | Quizkit status          | Notes                                                                                                                             |
| ------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Home / category browser                     | Built                   | No search-within-categories yet (cca-quiz had one)                                                                                |
| Quiz setup → play → results                 | Built                   | Normal + Chrono modes only                                                                                                        |
| Attempt history list                        | **Not started**         | `Attempt` model has everything needed; no `/history` page reads it                                                                |
| Survival mode                               | **Not started**         | `features.survivalMode` flag exists in config; no mode logic, no page                                                             |
| Practice mode                               | **Not started**         | `features.practiceMode` flag exists; same gap                                                                                     |
| Gamification (streaks/medals/points)        | Built                   | Toast-based feedback; original had a popup + confetti + sound — simplified, not ported                                            |
| Custom quiz builder (list/build/play/stats) | **Not started**         | `Quiz` Prisma model + `features.customQuizBuilder` flag exist; zero UI. `submitAttemptAction` only ever writes `quizType: "bank"` |
| Duels / multiplayer                         | Stub                    | `Duel` model + flag + one placeholder page, now session-gated (§6)                                                                |
| Forum                                       | Stub                    | `ForumThread`/`ForumPost` models + flag + placeholder, now session-gated                                                          |
| Courses / resource library                  | Stub                    | `Resource` model + flag + placeholder, now session-gated                                                                          |
| Admin: question CRUD                        | **Not started**         | `app/(app)/admin/page.tsx` shows counts only                                                                                      |
| Admin: category management                  | **Backend only**        | `createCategoryAction`/`deleteCategoryAction` exist in `features/categories/actions.ts` — no form or button anywhere calls them   |
| Admin: Excel bulk import                    | **Not started**         | `features.excelImport` flag exists, nothing wired to it                                                                           |
| Admin: AI question generation               | **Not started**         | `features.aiGeneration` flag exists; no LLM call wired, `ANTHROPIC_API_KEY` isn't even read anywhere yet                          |
| Admin: user role management                 | **Not started**         | —                                                                                                                                 |
| Admin: messaging (admin → user)             | **Not started**         | `Message` model exists, unused                                                                                                    |
| AdminStats                                  | **Not started**         | Was generic-enough in the original to be worth porting                                                                            |
| AgencyParticipation                         | Deliberately not ported | Was bank/org-specific in the original; only worth building for a vertical that actually needs org-unit-level reporting            |
| Profile edit                                | **Backend only**        | `updateProfileAction` exists in `features/profile/actions.ts`; the profile page is view-only, no form calls it                    |
| Notification settings                       | **Not started**         | `Profile.notifyDuel/notifyQuiz/notifyApp` fields exist, no UI toggles them                                                        |
| Notification bell / feed                    | **Not started**         | `Notification` model exists, unused                                                                                               |
| Message inbox                               | **Not started**         | Same as admin messaging above — one model, two unbuilt surfaces                                                                   |

**Suggested build order**, roughly by how much it unblocks: (1) Admin question/category CRUD — makes `prisma/seed.ts` unnecessary and lets every future fork author content through the app instead of hand-editing a seed script; (2) Attempt history + Profile edit — cheap, the backend already exists for one of them; (3) Custom quiz builder; (4) Survival/Practice modes; (5) Duels, Forum, Courses, notifications/messaging, AI generation, Excel import, AdminStats — build whichever a specific fork actually needs first, rather than all of them speculatively.

## 6. Fixed: the Admin nav button was visible to every signed-in user

Caught and fixed in a follow-up pass after the initial scaffold — worth understanding so it doesn't come back. Two separate bugs, both now fixed:

1. **`components/bottom-nav.tsx` showed the Admin tab to everyone**, gated only on `always: true` like Home/Quiz/Profile — no role check at all. The `/admin` _page_ itself was always correctly protected (`requirePermission("categories:write")` in `lib/session.ts` redirects non-admins), so this was never an actual access bypass, but it advertised an admin surface to every regular user, which is bad practice regardless. Fixed by computing the role **server-side** in `app/(app)/layout.tsx` (via `getSession()` + `resolveRole()`) and passing `isAdmin` down as a prop — the nav item is absent from the server-rendered output entirely for a non-admin, not just hidden client-side. `lib/session.ts`'s `getSession` is now wrapped in React's `cache()` so the layout and the page it wraps don't double-hit the session lookup in the same request.
2. **While fixing that, a related gap surfaced**: `proxy.ts` used an allowlist of _protected_ prefixes (`/quiz`, `/profile`, `/admin`, `/duel`, `/results` — note `/dashboard` was in there too, for a route that doesn't even exist). `/` (the home page), `/forum`, and `/courses` were never in that list, so the optimistic proxy-level redirect didn't fire for them — they were only actually protected because their Server Components happened to call `requireSession()`/`requireProfile()` themselves. The Forum/Courses/Duel stub pages did **not** call `requireSession()` at all, so if someone flipped `features.forum` on without noticing, that route would have been reachable while signed out. Fixed two ways: `proxy.ts` is now **fail-closed** — everything is protected by default except an explicit `PUBLIC_PATHS` allowlist (`/sign-in`, `/sign-up`) — so a newly-added route is protected automatically instead of only when someone remembers to list it; and the three stub pages (`duel`, `forum`, `courses`) now each call `requireSession()` directly as defense in depth, independent of the proxy.

Verified via curl against a running `next start` server (not just read the code and assumed): signed-out requests to `/`, `/admin`, and `/forum` all 307 to `/sign-in`; a signed-in non-admin's rendered home page contains zero occurrences of `/admin` anywhere in the payload, and a direct request to `/admin` still 307s them away; a user whose email is in `domain.config.ts → owners` sees the Admin link and gets a 200 from `/admin`. If you touch `proxy.ts`, `bottom-nav.tsx`, or add a new route under `app/(app)/`, re-run this kind of check rather than trusting the build passing — a missing auth check doesn't fail the build.

## 7. Deviations from the pasted tech-stack standard (deliberate, with reasons)

The user provided a "Web Application Tech Stack & Best Practices Standard" doc during the build (Next 16.3.2, TS 7, Zod 4.4.3, TanStack Query 5.102.3, RHF 7.86.0, Better Auth 1.7.1, Vitest 4.1.11, Playwright 1.62.1, ESLint 10.9.1, Prettier 3.9.6, Husky 9.1.7, Tailwind 4.3.3, Sentry 10.71.0). Registry versions at build time matched it almost exactly — it was accurate, not fabricated. Two places this repo deviates on purpose:

- **ESLint is pinned to `^9`, not `^10`.** `eslint-config-next` depends on `eslint-plugin-react`, and the latest published `eslint-plugin-react` (7.37.5, confirmed via `npm view eslint-plugin-react version` — there is no newer one) throws under ESLint 10's rule-context API. This isn't a stale pin on our side; it's upstream not being ready. **Before "fixing" this by bumping eslint,** re-check `npm view eslint-plugin-react version` — only bump once something newer than 7.37.5 exists, then confirm `npm run lint` actually runs clean.
- **No Serwist.** `@serwist/next`'s manifest-injection plugin is webpack-only; this project builds with Turbopack (the stack standard's own default). `public/sw.js` is a minimal hand-written service worker instead (app-shell caching, no offline question queue yet). Revisit if/when Serwist ships Turbopack support, or build the offline queue by hand (IndexedDB) per `docs/multi-domain-playbook.md` §7.
- **SQLite, not Postgres, as the datasource right now.** Deliberate for local dev speed. The swap to Postgres is documented and is meant to happen before any real fork goes live — see the playbook §5. Don't treat SQLite as a long-term choice; it's the dev default.

## 8. Non-obvious gotchas (so you don't rediscover these the hard way)

- **Prisma 7 requires a runtime driver adapter** — `lib/db.ts` constructs `PrismaBetterSqlite3` explicitly and passes it to `new PrismaClient({ adapter })`. The `datasource` block in `prisma/schema.prisma` only declares `provider = "sqlite"`, no `url` — that field was removed in Prisma 7 and putting it back will fail schema validation (`P1012`). The actual connection string for **migrations** lives in `prisma7.config.ts`'s `datasource.url` (reads `DATABASE_URL`); the actual connection for the **running app** lives in `lib/db.ts`'s adapter construction. Two different mechanisms, both need to point at the same file.
- **Never put `@default(...)` on a `Json` field in `prisma/schema.prisma`.** Prisma generates `DEFAULT {}` / `DEFAULT []`, which is invalid SQLite DDL and silently corrupts the migration (it applies everything _before_ the broken statement, then fails — you end up with a partially-created database that looks fine until a query against a missing table fails). Pass the default explicitly at `.create()` time instead (see `lib/session.ts`'s `requireProfile()`).
- **A standalone `tsx` script (like `prisma/seed.ts`) does not get `.env` loaded automatically the way `next dev`/`next build` do.** It needs `import "dotenv/config";` as its first line, or `process.env.DATABASE_URL` will be `undefined` and Prisma will silently connect to the wrong (empty) database.
- **Better Auth's `Account` model needs an `issuer` field** that isn't in a lot of older docs/tutorials — confirmed by reading the actual shipped type at `node_modules/@better-auth/core/dist/db/schema/account.d.mts` rather than trusting memory. If a future Better Auth upgrade changes its core schema again, that's the file to check for ground truth, not blog posts.
- **`next/font/google` needs a static import** — `app/layout.tsx`'s font choice can't be driven by `config/domain.config.ts` at runtime. The config's `fontDisplayLabel`/`fontBodyLabel` fields are documentation of intent; changing the actual font means editing the import in `app/layout.tsx` too. See the playbook §2 step 5.
- **`next dev` regenerates the top block of `AGENTS.md`** (the "This is NOT the Next.js you know" notice) — don't hand-edit inside the `BEGIN:nextjs-agent-rules` / `END` markers, it'll just get overwritten. `CLAUDE.md` includes it via `@AGENTS.md`.
- **Default new routes/nav items to protected, not to visible.** The admin-nav incident in §6 happened because both `bottom-nav.tsx` and the original `proxy.ts` defaulted a new item to "shown"/"unprotected" unless someone opted it out. When adding a nav entry, a route, or a Server Action, start from "who should NOT see/reach this" and gate explicitly, rather than adding it open and meaning to lock it down later.

## 9. Suggested first move in a new session

**The goal is full feature parity with cca-quiz (§5), not stopping at "core skeleton + stubs."** Ask the user what they want before assuming, but if they don't have something specific in mind, work down the build order in §5: Admin question/category CRUD first (unblocks everything else and retires the seed-script dependency), then Attempt history + Profile edit (cheap, backend already half-exists), then the custom quiz builder, then Survival/Practice modes, then the social/admin-extra features roughly in whatever order the eventual verticals actually need them. `npx playwright install && npm run test:e2e` is a good confidence-building first move regardless. `git add` + first commit only once the user actually asks for one.
