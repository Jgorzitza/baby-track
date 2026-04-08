# Quality Gates

All work performed on the `bbtrack` project must pass these gates.

## Gate 1: TypeScript
- Strict mode is enabled (`tsconfig.json`).
- **No `any` is allowed** (Enforced by ESLint `@typescript-eslint/no-explicit-any: error`).
- All props, state, and API responses must be typed.
- Typecheck must pass: `npm run typecheck`.

## Gate 2: Linting
- ESLint 10 is configured with `@eslint-react` and `eslint-plugin-react-compiler`.
- No lint errors allowed: `npm run lint`.
- Formatting must follow `.prettierrc`.

## Gate 3: Testing
- All core business logic (e.g., feeding timers, diaper history summaries) must have unit tests.
- Test runner: Vitest.
- Mocking: MSW or similar (TBD in Phase 3).

## Gate 4: Mobile Web Baseline
- Every UI change must be verified for:
  - Touch targets (44x44px min).
  - No horizontal scrolling on mobile viewports.
  - No hover-only interactions.
  - Performance on low-tier mobile devices (simulated).

## Gate 5: Production Build
- The build must succeed without warnings: `npm run build`.
- Bundle size must be monitored for PWA efficiency.

## Gate 6: Security & Privacy
- No secrets in the codebase.
- Supabase RLS policies must be verified for every new table.
- Data access must be restricted to household members.

## Gate 7: Documentation
- Significant changes must be reflected in `tech-stack.md` or the relevant phase document.
- New components should have basic usage notes if their complexity justifies it.
- Mocks vs real implementation must be clearly labeled.
