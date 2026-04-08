# Tech Stack Documentation

## Core Decisions

### Frontend: React 19 + TypeScript + Vite + React Compiler
Chosen for:
- **Fast Iteration**: Vite's HMR provides a near-instant developer experience.
- **Type Safety**: TypeScript strict mode is mandatory.
- **Modern Ecosystem**: React 19 with the **React Compiler** (automated memoization) ensures high performance on mobile devices without manual `useMemo`/`useCallback` overhead.
- **Modern Linting**: ESLint 10 with `@eslint-react/eslint-plugin` for the most up-to-date React 19+ best practices.

### Hosting: Cloudflare Pages
- **Performance**: Edge-based delivery for fast mobile loading.
- **Integration**: Simple deployment and CI/CD.
- **Serverless**: Zero infrastructure management.

### Backend/Auth/DB: Supabase (Postgres + RLS)
- **Auth**: Built-in Email + Password auth with simple household-based access control.
- **Database**: Postgres with Row Level Security (RLS) ensures that data is only accessible to authorized household members.
- **API**: Automatically generated REST and Realtime APIs.

### Offline Support: IndexedDB Queue/Cache
- **Resilience**: The app must work in low-connectivity environments (e.g., doctor's office, middle of the night).
- **Model**: Local-first for writes (queued) and cached for reads. Supabase is the source of truth when online.
- **Tooling**: Using `idb` for a clean Promise-based interface to IndexedDB.

### Mobile-First / PWA
- **Installability**: Using `vite-plugin-pwa` to create a web app manifest and service worker.
- **App Shell**: The UI shell should load instantly, with data populated from cache/API.
- **Why no native app?**: Rapid deployment, no app store gatekeepers, and easy sharing via URL for family members.

## Architectural Constraints

### Why no Next.js?
Next.js is SSR-first. bbtrack is designed to be an **Offline-First PWA** using an **App Shell** model. Client-side rendering with a service worker cache is more appropriate for this mobile-native-feeling requirement.

### Why no magic links?
Email + Password is more reliable in various mobile browser environments and easier for some users to manage consistently across devices.

### Household-Based Access
Data is siloed by **Household ID**, not by User ID. Both parents are members of the same household and share full access to the baby's data.

### Doctor Appointment Mode
Always available to provide a quick summary of recent tracking (sleep, feeding, diaper habits, growth). This ensures parents are prepared even if an appointment was not formally scheduled in the app.
