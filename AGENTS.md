# Agent Instructions for bbtrack

This document is foundational and takes precedence over general workflows. All coding agents must follow these rules strictly.

## Mandates

### Phased Execution
1. **Foundation**: Repo setup, docs, guardrails (Current Phase).
2. **UI/UX Design**: App Shell, layout, navigation, core screens (Mocks only).
3. **Frontend Implementation**: Interactive UI, local state management, mock data services.
4. **Offline/Sync**: IndexedDB integration, queueing, sync logic.
5. **Backend/Auth**: Supabase Auth, Postgres schema, RLS.
6. **Product Integration**: Full E2E flow, real Supabase integration.
7. **Production Hardening**: Service worker refinements, PWA manifests, deployment checks.

### Quality Gates
- Every completed task must pass: `npm run lint && npm run typecheck && npm run build`.
- **STRICT TYPING**: No `any` allowed. ESLint will fail if `any` is used.
- **REACT COMPILER**: Rely on the React Compiler for memoization. Avoid manual `useMemo`/`useCallback` unless specifically required for stability or non-rendering logic.
- No dead placeholders (e.g., `// TODO: Implement later`) in production paths.
- All mocks must be explicitly called out as such.

### Mobile-First
- UI must be validated in mobile viewports (e.g., 375x812, 390x844).
- Controls must be touch-friendly (min 44x44px target).
- No hover-only interactions.

### No Diagnosis Logic
- The app tracks data.
- **NEVER** implement logic that provides medical advice or diagnoses.
- Reports and summaries must be descriptive, not prescriptive.

## Operational Rules
- Use official documented methods only for all libraries (React, Vite, Supabase, idb).
- Keep components small and modular.
- Every phase completion must include:
  - List of files changed.
  - Summary of implemented logic.
  - Remaining tasks in the current phase.
  - Identified risks or trade-offs.

## Documentation First
- Before implementing a new feature, update relevant docs or create a design spec if the change is architectural.
- Maintain the source of truth in `docs/` and `tech-stack.md`.
