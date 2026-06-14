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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getPostHog } from '../lib/analytics/init';
import { apolloClient } from '../lib/apollo/client';
import { AuthProvider } from '../lib/auth/AuthProvider';
import { useNotificationsBootstrap } from '../lib/notifications/bootstrap';
import { initSentry } from '../lib/sentry/init';
import { ThemedStatusBar } from '../lib/theme/ThemedStatusBar';
import { ThemeProvider } from '../lib/theme/ThemeProvider';
import { useAppFonts } from '../theme/fonts';

// Module-level side effects — run once when this file is first evaluated.
// Sentry must be ready before any boot-time throw can occur.
initSentry();
// Keep the native splash up until Inter + JetBrains Mono are loaded, so the
// first paint already uses the brand fonts (no flash of system font).
void SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element {
  const posthog = useMemo(() => getPostHog(), []);
  const fontsLoaded = useAppFonts();
  useNotificationsBootstrap();

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Hold first paint until fonts are ready (native splash stays visible).
  if (!fontsLoaded) return <></>;

  const tree = (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider>
          <ApolloProvider client={apolloClient}>
            <AuthProvider>
              <BottomSheetModalProvider>
                {/* Status bar icons invert with the active scheme. */}
                <ThemedStatusBar />
                {/* Root Stack — gives every pushed route (course, invest, legal, …)
                    a real navigation history so router.back() + swipe-back work.
                    headerShown:false because screens render their own headers. */}
                <Stack screenOptions={{ headerShown: false }} />
              </BottomSheetModalProvider>
            </AuthProvider>
          </ApolloProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (posthog === null) return tree;
  return <PostHogProvider client={posthog}>{tree}</PostHogProvider>;
}
