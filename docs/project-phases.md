# Project Phases

## Phase 1: Foundation (CURRENT)
- Repository setup, documentation, dependency configuration.
- Strict quality guardrails (TypeScript, ESLint, Prettier).
- PWA baseline scaffolding.
- Cloudflare/Supabase configuration (example.env).

## Phase 2: UI/UX Shell & Design
- **Objective**: Establish the app's look and feel without backend integration.
- App Shell (Bottom Tab Bar, Top Bar).
- Route structure (React Router).
- Core Screens (Dashboard, Sleep, Feeding, Diaper, Health, Doctor).
- Mocks for all data fetching.

## Phase 3: Interactive Frontend & State
- **Objective**: Make the UI "feel" functional using local state.
- Interactive tracking components (Play/Pause for feeding, timers).
- Local storage for session persistence during testing.
- Form validation for all tracking entries.

## Phase 4: Offline-First & Sync Layer
- **Objective**: Ensure the app works without a network connection.
- IndexedDB integration (`idb`).
- Queueing system for writes.
- Conflict resolution logic (Simple LWW - Last Write Wins).
- Background sync using Service Workers.

## Phase 5: Backend & Authentication
- **Objective**: Establish the source of truth and secure access.
- Supabase project setup.
- Database Schema (Households, Profiles, Tracking Entries).
- Row Level Security (RLS) policies.
- Email + Password Auth flow.

## Phase 6: Product Integration
- **Objective**: Connect the frontend to the real backend.
- Replace mock services with Supabase client calls.
- Integrated sync layer with Supabase Realtime/REST.
- End-to-end testing of household sharing.

## Phase 7: Production Hardening & PWA
- **Objective**: Prepare for real-world usage.
- Performance optimization (Asset caching, Bundle size).
- Accessibility audit (A11y).
- Final PWA manifest and service worker refinements.
- Cloudflare Pages deployment pipeline.
