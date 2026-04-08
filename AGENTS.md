# Agent Instructions for bbtrack

This document is foundational and takes precedence over general workflows. All coding agents must follow these rules strictly.

## Mandates

### Technical Integrity
- **OFFICIAL DOCS ONLY**: Use official documented methods only for React 19, Vite 8, Cloudflare Pages, Supabase, and IndexedDB.
- **STRICT TYPING**: No `any` allowed. ESLint will fail if `any` is used. Use TypeScript 6.0 standards.
- **REACT COMPILER**: Rely on the React Compiler for memoization. Avoid manual `useMemo`/`useCallback` unless specifically required for non-rendering logic.
- **MOBILE-FIRST**: UI must be validated in mobile viewports (e.g., 375x812). Controls must be touch-friendly (min 44x44px).

### Execution Rules
- **UI-FIRST ARCHITECTURE**: No backend, schema, or auth implementation work is allowed until the UI prototype has been fully approved by the user.
- **NO SCOPE DRIFT**: Do not implement features or AI logic not explicitly defined in the locked product contract.
- **NO PLACEHOLDERS**: No dead placeholder functions (e.g., `// TODO`) in production paths. Every phase must be functionally complete.
- **COMPLETION REQUIREMENTS**: Every task/phase completion must include:
  - Files changed.
  - What was implemented.
  - What remains.
  - **ASSUMPTIONS MADE**.
  - Risks / tradeoffs identified.

## Quality Gates
- Every completed task must pass: `npm run lint && npm run typecheck && npm run build`.
- **TESTING MANDATORY**: All core business logic (timers, summaries, state transitions) must have unit tests.
- **MOCK LABELING**: Explicitly call out where mocks are used vs real implementation.
