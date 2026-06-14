// Root layout for Expo Router (CLAUDE.md §14, prompt 30).
// Provider stack:
//   GestureHandlerRootView → SafeAreaProvider → ApolloProvider → AuthProvider → Stack
// Auth-aware redirects land in MM-011 (login screen) and MM-014 (tab navigation).

import 'react-native-gesture-handler';

import { ApolloProvider } from '@apollo/client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { apolloClient } from '../lib/apollo/client';
import { AuthProvider } from '../lib/auth/AuthProvider';

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
