# Multi-domain playbook

No BS version: fork the repo, edit one file, reseed, ship. This doc is the "how." For the "why" behind the architecture, see the Quizkit reference doc from the planning phase — this file assumes you've read it or don't need to.

## 1. What actually changes between forks

| Tier                                      | Examples                                                                                                                                                    | Where it lives                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Never changes** — the engine            | Auth, session/permission checks, the quiz scoring/streak/medal logic, the RHF+Zod+Server Action pattern, shadcn primitives                                  | `lib/`, `components/ui/`, `app/api/auth/` |
| **Changes once, in one file**             | Brand, colors, terminology, taxonomy seed, AI persona, feature flags, owners                                                                                | `config/domain.config.ts`                 |
| **Changes per vertical, needs real code** | Anything not already built (duels/forum/courses are stubs), anything bespoke to one field (CE-credit tracking, before/after galleries, parent report cards) | New `features/<name>/` folder — see §4    |

If you're editing anything outside `config/domain.config.ts` and it's not a genuinely new feature, you're probably fighting the skeleton instead of using it. Stop and check whether it belongs in the config instead.

## 2. Fork checklist

1. `npx degit <this-repo> my-new-app` (or "Use this template" on GitHub).
2. `cd my-new-app && npm install`.
3. `cp .env.example .env` — generate a fresh secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never reuse a secret across forks.
4. Edit `config/domain.config.ts` end to end: `brand`, `theme.light`/`theme.dark` (oklch strings, same variable names shadcn already reads — steal a palette from a design tool rather than hand-deriving oklch numbers), `terminology`, `taxonomySeed`, `aiPersona`, `features`, `owners`, `pwa`.
5. `app/layout.tsx` has two `next/font/google` imports (`Geist`, `Geist_Mono`). Font family needs a static import — Next can't pick a Google Font at runtime from config — so if this vertical wants different typography, swap the import here to match `theme.fontDisplayLabel`/`fontBodyLabel` in the config. This is the one field in the config that's documentation, not automation.
6. Rewrite `prisma/seed.ts` — replace the demo Science/History/Geography content with real starter categories and questions for this vertical.
7. `npm run db:migrate && npm run db:seed`.
8. Generate PWA icons (192×192, 512×512 maskable) into `public/icons/` from your logo — any favicon generator works.
9. `npm run dev` and walk the golden path yourself: sign up → take a quiz → see results → install to home screen. Then `npm run lint && npm run typecheck && npm test && npm run build` before you trust it.
10. Set the owner's email(s) in `domain.config.ts → owners` — this is what makes someone superadmin. There is no hardcoded email anywhere in this codebase; keep it that way.
11. Deploy (Vercel), set the same env vars in production, swap SQLite for Postgres first (§5).

## 3. The feature-set problem — read this part twice

Every vertical needs a different slice of functionality. That's not a bug to route around, it's the point. Three different situations, three different moves:

**A. The code already exists — just gate it.** Excel import, AI question generation, survival mode, practice mode. Flip the boolean in `domain.config.ts → features`. Nothing else to touch.

**B. The flag exists, the route exists, the implementation doesn't yet.** Duels, forum, courses ship in this skeleton as _stubs_ — a flag, a nav entry, a page that says "not built yet." If a vertical needs one, flip the flag on and actually build it, following §4 below. If it doesn't, leave the flag off and the route 404s.

**C. It doesn't exist anywhere and never will unless you build it.** CE-credit tracking for a health vertical, a before/after portfolio for beauty, parent-facing report cards for education, a branch-participation report for corporate training. There's no flag for this because it's not generic — it's specific to one field. Build it the same way as (B): a new `features/<name>/` folder. It will not appear in any other fork unless you deliberately copy it over.

The rule that keeps this from turning into spaghetti as you accumulate forks: **a feature's code lives entirely inside its own `features/<name>/` folder**, plus at most one thin route file under `app/(app)/<name>/`. The only things outside that folder allowed to know it exists are `components/bottom-nav.tsx` (reading the flag to show/hide the tab) and the route file itself. If you catch yourself importing from `features/duels/` inside `features/quiz/`, stop — either the two features should merge, or the shared bit belongs in `lib/`.

## 4. Adding a feature module — the pattern to copy

`features/quiz/` is the reference implementation; it's the one fully built end to end. Copy its shape:

1. **`schemas.ts`** — every input as a Zod schema, `z.infer` for the type. This is the single source of truth for the shape (per the team's tech stack standard).
2. **`actions.ts`** — Server Actions. Every one starts with `requireSession()` or `requirePermission("...")` from `lib/session.ts`. Never trust a client-sent derived value — see the comment in `features/quiz/actions.ts` explaining why `isCorrect` is recomputed server-side instead of trusted from the client.
3. **`queries.ts`** — a query-key factory + `queryOptions()`, only if the feature needs client-side reactive reads. Most list/detail pages don't: a Server Component calling `db.*` directly (see `app/(app)/page.tsx`, `app/(app)/admin/page.tsx`) is simpler and is the default. Reach for TanStack Query when a client component needs to refetch/poll/optimistically update without a full navigation — that's what `features/quiz/queries.ts` + `quiz-play-client.tsx` demonstrate (prefetch on the server, hydrate on the client).
4. **`components/*.tsx`** — client components for anything interactive.
5. Add any new Prisma model(s) to `prisma/schema.prisma`, then `npm run db:migrate`. Remember: no scalar lists (`String[]`) — this schema targets SQLite in dev, which doesn't support them. Use `Json` instead (see the comment at the top of the Domain section in `schema.prisma`). Also: don't put `@default(...)` on a `Json` field — Prisma emits invalid SQLite DDL for it (`DEFAULT {}`, not valid SQL). Pass the default explicitly at `.create()` time instead, the way `lib/session.ts`'s `requireProfile()` does.
6. **`app/(app)/<name>/page.tsx`** — thin wrapper that calls into `features/<name>/actions.ts` or renders `features/<name>/components/*`.
7. Add a flag to `config/domain-schema.ts → features` and `domain.config.ts`, and a nav entry in `components/bottom-nav.tsx` gated on it.
8. Add a Vitest test for any real logic — pure functions especially, see `lib/quiz-engine.test.ts` for the pattern — and a Playwright smoke test if it's core to the golden path.

## 5. Swapping SQLite for Postgres

Do this before any vertical goes in front of real users — SQLite here is a local/dev convenience, not a production plan.

1. `prisma/schema.prisma`: change `datasource db { provider = "sqlite" }` to `provider = "postgresql"`.
2. `lib/db.ts`: swap the `PrismaBetterSqlite3` adapter for `@prisma/adapter-pg` (or your host's adapter — Neon, Supabase-as-just-Postgres, and RDS all publish one), constructed from `DATABASE_URL`.
3. `prisma7.config.ts` already reads `DATABASE_URL` for migrations — just point that env var at Postgres.
4. `npm run db:migrate` against the new database.
5. Nothing else changes. Every query in every `features/*/actions.ts` file is plain Prisma Client calls — provider-agnostic by construction.

## 6. Worked example: forking for a Beauty & Spa academy

Concretely, here's what changes to go from this demo instance to "Glow Beauty Academy":

```ts
// config/domain.config.ts
brand: {
  name: "Glow Beauty Academy",
  tagline: "Master every technique, one quiz at a time.",
  logoUrl: "/icons/icon-512.png",
},
theme: {
  fontDisplayLabel: "Playfair Display", // + swap the import in app/layout.tsx
  fontBodyLabel: "Geist",
  light: { primary: "oklch(0.55 0.15 10)", "primary-foreground": "oklch(0.98 0 0)", ... },
  dark: { /* brighter equivalents for contrast on a dark background */ },
},
terminology: { orgUnit: "Studio", memberId: "Client ID", resultLabel: "Assessment" },
taxonomySeed: [
  { name: "Skincare", icon: "🧴" },
  { name: "Color Theory", icon: "🎨" },
  { name: "Client Consultation", icon: "💬" },
],
aiPersona: "You are a senior esthetics instructor certifying junior estheticians. Ask practical, scenario-based questions.",
features: {
  duels: false, forum: false, survivalMode: false,       // this academy doesn't want competitive/social pressure
  courses: true, customQuizBuilder: true, excelImport: true, aiGeneration: true, practiceMode: true,
  messaging: false,
},
owners: ["director@glowbeauty.example"],
pwa: { shortName: "Glow", themeColor: "#B4557A", backgroundColor: "#ffffff" },
```

Plus:

- `app/layout.tsx`: swap the `Geist` display-font import for `Playfair_Display` from `next/font/google`.
- `prisma/seed.ts`: real skincare/color-theory/consultation questions instead of the demo trivia.
- One genuinely new feature this vertical needs that no flag covers — a before/after portfolio: build `features/portfolio/` following §4, add a `Portfolio` Prisma model (client name, before/after image URLs via Supabase/S3 storage, a caption), a route at `app/(app)/portfolio/page.tsx`, a nav entry gated on a new `features.portfolio` flag.

That's the entire fork: one config file, one font-import line, one seed rewrite, one genuinely new feature built because it doesn't map to anything already in the skeleton. Duels/forum/survival stay off. Everything else — auth, gamification, quiz engine, admin permission model, PWA shell — is untouched.

## 7. Calls this repo already made, so you don't re-litigate them per fork

- **Fork-per-vertical, not multi-tenant.** Each vertical is its own repo/deploy. If you eventually want one deployment serving every vertical by subdomain, that's a materially bigger, separate project.
- **SQLite for dev, Postgres for prod** — the swap is two files (§5), not a rewrite.
- **ESLint is pinned to v9, not the v10 the team standard names.** `eslint-plugin-react` — the version `eslint-config-next` currently bundles (7.37.5, also the latest one published) — throws under ESLint 10's rule API. Run `npm view eslint-plugin-react version` occasionally; bump `eslint` and confirm `npm run lint` once a compatible release ships.
- **No i18n layer.** All strings are inline English. A second language is a real feature (a strings dictionary + a provider), not a config flag — don't try to fake it in `domain.config.ts`.
- **Serwist isn't wired in.** Its Next.js plugin (`@serwist/next`) depends on webpack; this project builds with Turbopack. `public/sw.js` is a minimal hand-rolled service worker instead — it caches the app shell and static assets, but it does not yet cache question data or queue offline quiz attempts the way the original CCA Quiz app's `localStorage` queue did. That's the next real addition if a vertical needs full offline play, most likely via IndexedDB (`idb-keyval` or similar) plus the same outbox pattern, or by revisiting Serwist once it supports Turbopack.
- **The superadmin escape hatch is `domain.config.ts → owners`, an email allowlist — never a literal string buried in application code.** Keep it that way in every fork.
