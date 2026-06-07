// Root layout for Expo Router (CLAUDE.md §14, prompt 30).
// Provider stack:
//   GestureHandlerRootView → SafeAreaProvider → ApolloProvider → AuthProvider → Slot
// Side effects on boot:
//   - Sentry init (MM-016) — call BEFORE rendering anything that could throw
//   - PostHog provider (MM-017) — wraps the tree below; null client when key
//     is unset, treated as a no-op
//   - Notifications bootstrap (MM-018) — Android channel + deep-link router
// Auth-aware redirects live in the route groups themselves ((auth)/_layout for
// public, (tabs)/_layout for private).

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

import { ApolloProvider } from '@apollo/client';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getPostHog } from '../lib/analytics/init';
import { apolloClient } from '../lib/apollo/client';
import { AuthProvider } from '../lib/auth/AuthProvider';
import { useNotificationsBootstrap } from '../lib/notifications/bootstrap';
import { initSentry } from '../lib/sentry/init';

// Module-level side effect — runs once when this file is first evaluated.
// Sentry must be ready before any boot-time throw can occur.
initSentry();

export default function RootLayout(): React.JSX.Element {
  const posthog = useMemo(() => getPostHog(), []);
  useNotificationsBootstrap();

  const tree = (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <BottomSheetModalProvider>
              <StatusBar style="light" />
              <Slot />
            </BottomSheetModalProvider>
          </AuthProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (posthog === null) return tree;
  return <PostHogProvider client={posthog}>{tree}</PostHogProvider>;
}
