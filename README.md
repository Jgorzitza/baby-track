# bbtrack

A mobile-first newborn tracking web app designed for private family use. This project is built to feel as close to a native app as possible while running in a mobile web browser.

## Locked Stack
- **Frontend**: React 19 + TypeScript + Vite + **React Compiler**
- **Hosting**: Cloudflare Pages
- **Backend/Auth/DB**: Supabase (Auth, Postgres, RLS)
- **Offline Support**: IndexedDB queue/cache (App Shell architecture)
- **Linting**: ESLint 10 + `eslint-react` (modern React 19 rules)

## Project Vision
- **Private Family Use**: Targeted at 2-parent shared households.
- **Shared Household Model**: Both parents have full access to all household data.
- **Doctor Appointment Mode**: Always accessible to provide insights and summaries.
- **Mobile-First**: Primary usage is mobile web; desktop is secondary.

## Development Setup

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase credentials.

- Hosted Supabase projects should use `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is also accepted for compatibility with Supabase quickstart examples.
- `VITE_SUPABASE_ANON_KEY` is kept only as a local/self-hosted fallback.
- This app does not use raw Postgres credentials in the browser.
```bash
cp .env.example .env
```

### Commands
- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking
- `npm run test`: Run unit tests
- `npm run verify`: Run all quality checks (lint + typecheck + build + test)
- `npm run supabase:start`: Start local Supabase services when Docker is available
- `npm run supabase:reset`: Apply the repo migrations to the local Supabase stack
- `npm run supabase:types`: Generate `src/lib/supabase/database.types.ts` from a live Supabase project once `VITE_SUPABASE_PROJECT_ID` is set
- `npm run test:e2e`: Run Playwright E2E flows against a configured backend
- `npm run verify:full`: Run lint, typecheck, unit tests, build, and E2E tests

## Real Backend Integration
- SQL migrations live in [`supabase/migrations`](/Users/jgorzitza/bbtrack/supabase/migrations).
- The frontend now expects real Supabase Auth + Postgres + RLS configuration via `.env`.
- The live Supabase project must have email confirmations disabled for v1 to match the locked password-auth flow.
- IndexedDB is used for the pending mutation queue, cached active sessions, and cached summaries. Postgres remains the source of truth.

## Deployment
Deployed to **Cloudflare Pages**. CI/CD is configured to build and deploy from the `main` branch.

## Quality Expectations
- **Strict TypeScript**: No `any` without justification.
- **Phased Execution**: Features are implemented in strict phases.
- **No Diagnosis**: The app tracks data but does not provide medical advice.
- **Mobile Excellence**: Every UI change must be validated on mobile viewports.

## Non-Goals
- No AI medical diagnosis or advice.
- No public SaaS or multi-tenant complexity beyond simple household sharing.
- No SSR-first or backend-heavy implementation (App Shell / Offline-first focus).
