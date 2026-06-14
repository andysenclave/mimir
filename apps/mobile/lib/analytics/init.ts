// MM-017 — PostHog mobile init.
// Called once from app/_layout.tsx via the PostHog provider.

import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

function readEnv(name: string): string | undefined {
  const fromExtra = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[name];
  const fromProcess = (process.env as Record<string, string | undefined>)[name];
  return fromExtra ?? fromProcess;
}

let client: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (client !== null) return client;

  const apiKey = readEnv('EXPO_PUBLIC_POSTHOG_KEY');
  const host = readEnv('EXPO_PUBLIC_POSTHOG_HOST') ?? 'https://us.i.posthog.com';

  if (apiKey === undefined || apiKey.length === 0) {
    if (__DEV__) {
      console.info('[posthog] EXPO_PUBLIC_POSTHOG_KEY not set — analytics disabled');
    }
    return null;
  }

  client = new PostHog(apiKey, {
    host,
    captureNativeAppLifecycleEvents: true,
    flushAt: 20,
    flushInterval: 10_000,
  });
  return client;
}

export function identifyUser(userId: string): void {
  const ph = getPostHog();
  if (ph === null) return;
  // Per CLAUDE.md §11 + §17 — identify by user id only, no PII.
  ph.identify(userId);
}

export function resetAnalytics(): void {
  const ph = getPostHog();
  if (ph === null) return;
  ph.reset();
}
