// MM-016 — Sentry mobile init. Called once at app boot from app/_layout.tsx
// before any other code can throw. Safe to call without a DSN: when missing,
// Sentry no-ops (we don't want dev-mode crashes blocking anything).

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

import { scrubPII } from './scrubber';

function readEnv(name: string): string | undefined {
  const fromExtra = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[name];
  const fromProcess = (process.env as Record<string, string | undefined>)[name];
  return fromExtra ?? fromProcess;
}

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = readEnv('EXPO_PUBLIC_SENTRY_DSN');
  const env = readEnv('EXPO_PUBLIC_ENV') ?? 'development';
  const release = readEnv('EXPO_PUBLIC_APP_VERSION');

  // No DSN = silent no-op. Andy plugs in DSN once the Sentry project exists
  // (env handling per session decision: optional in dev, required in staging+prod).
  if (dsn === undefined || dsn.length === 0) {
    if (__DEV__) {
      console.info('[sentry] EXPO_PUBLIC_SENTRY_DSN not set — Sentry disabled');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: env,
    release: release ?? 'unknown',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30_000,
    // Sample everything in dev/staging; tune down in production once we have signal.
    tracesSampleRate: env === 'production' ? 0.2 : 1.0,
    // Sentry RN's `ErrorEvent` type isn't exported by name (lives in @sentry/core
    // internals). Cast through the structural ScrubbableEvent we own — runtime
    // shape is identical, only the nominal type label differs.
    beforeSend: scrubPII as Required<NonNullable<Parameters<typeof Sentry.init>[0]>>['beforeSend'],
    enableNative: true,
    debug: __DEV__,
  });
}

// Helper used by the dev-only crash button on the Profile tab.
export function triggerTestCrash(): void {
  throw new Error('[mimir-mobile] dev test crash — MM-016 sanity check');
}

// Helper for AuthProvider.identify calls.
export function setSentryUser(userId: string | null): void {
  if (!initialized) return;
  if (userId === null) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({ id: userId });
  }
}
