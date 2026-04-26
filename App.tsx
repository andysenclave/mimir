/**
 * Main application entry point
 * Sets up navigation and core app structure
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@/navigation/RootNavigator';

/**
 * Deep linking configuration for the app
 * Allows navigation to specific screens via URLs like: mimir://watchlist
 */
const linking = {
  prefixes: ['mimir://', 'https://mimir.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Watchlist: 'watchlist',
          Portfolio: 'portfolio',
          Trade: 'trade',
          Profile: 'profile',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Signup: 'signup',
        },
      },
    },
  },
};

export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator linking={linking} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
