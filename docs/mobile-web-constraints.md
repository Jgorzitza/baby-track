# Mobile Web Constraints

The `bbtrack` app is built primarily for mobile web browsers. These constraints must be respected in every UI phase.

## Browser Support
- Latest versions of iOS Safari and Android Chrome.
- Responsive design from 320px (e.g., SE) up to 430px (e.g., Pro Max).
- Desktop view is a centered "mobile frame" (secondary support).

## Offline Support & Persistence
- **IndexedDB**: The primary storage for cached data and the outbound write queue.
- **Service Worker**: Cache static assets and the App Shell.
- **Browser Storage Limits**: Be mindful of total storage size (unlikely to be an issue for this scale).
- **Clearing Cache**: Users may clear their browser cache, so the Supabase sync must be robust.

## UX & UI
- **No Hover**: Do not use `:hover` for critical information or interactions.
- **Active States**: Use `:active` to provide touch feedback.
- **Form Inputs**: Use appropriate `inputmode` (e.g., `numeric`, `decimal`) for touch keyboards.
- **Safe Area Insets**: Account for notches and bottom home bars using `env(safe-area-inset-*)`.
- **Address Bar**: Mobile browsers frequently hide/show the address bar. Use relative units (vh, %, or modern `svh`) with care.

## Connectivity
- **Latency**: Assume a high-latency or intermittent connection.
- **Optimistic UI**: Every user action should update the UI immediately, even if the sync to Supabase is pending.
- **Sync Status**: Provide a non-intrusive indicator if the app is currently offline or has pending writes.

## PWA Behavior
- **Stand-alone Mode**: When "Added to Home Screen", the app should look and feel like a native application (no browser UI).
- **Update Strategy**: Using `autoUpdate` for service workers to ensure parents are always on the latest version.
