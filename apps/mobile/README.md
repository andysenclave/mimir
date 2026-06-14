# @mimir/mobile

React Native (Expo SDK 52+) app for Mimir paper trading + investment learning.

See `CLAUDE.md` §14 (mobile conventions) and `docs/coding-prompts/30-mobile-screen-scaffold.md`.

## Development

```bash
# from repo root
pnpm install
pnpm --filter mobile dev          # starts Metro
pnpm --filter mobile ios          # iOS dev build (requires EAS / Xcode)
pnpm --filter mobile android      # Android dev build
```

Open Expo Go on your iPhone, scan the QR — the placeholder home screen renders a sample ₹ value and market-open indicator (sourced from `@mimir/shared`).

## Stack

- Expo SDK 52+ / React Native 0.76+ (new architecture enabled)
- Expo Router (file-based routing) — `app/` is the routing root
- TypeScript 5.7 strict
- Reanimated 3 + Gesture Handler
- Apollo Client + GraphQL Codegen (added in MM-007)
- NativeWind v4 + React Native Reusables (added later in Sprint 1)
- Heimdal SDK / ADR-0001 fallback for auth (MM-009)

## Layout

```
apps/mobile/
├── app/                       # Expo Router (file-based)
│   ├── _layout.tsx            # Root layout — providers + status bar
│   └── index.tsx              # Placeholder home (MM-002)
├── assets/                    # Icons, splash, fonts (added MM-013)
├── components/                # Added in Sprint 2+
├── features/                  # Added in Sprint 2+
├── graphql/                   # Codegen output + .graphql operations (MM-007)
├── hooks/                     # Cross-feature hooks
├── lib/                       # Utilities, integrations
├── stores/                    # Zustand stores
├── theme/                     # NativeWind tokens (added later)
├── app.json                   # Expo config
├── babel.config.js
├── metro.config.js            # Monorepo-aware
└── tsconfig.json              # Extends ../../tsconfig.base.json
```
