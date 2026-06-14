// (auth) route group — login + signup live here, both unauthenticated.
// If the user is already signed in, this layout redirects them to the splash
// route (which then routes onward to onboarding or tabs).

import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthProvider';
import { useThemeTokens } from '@/theme/use-theme-tokens';

export default function AuthLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const tokens = useThemeTokens();

  if (isLoading) return <View className="flex-1 bg-bg-primary" />;
  if (isAuthenticated) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Stack screen background — only place this token can't be a className
        // because Stack's screenOptions doesn't accept className. Going through
        // tokens preserves the no-hardcoded-hex rule (prompt 22).
        contentStyle: { backgroundColor: tokens.bg.primary },
        animation: 'fade',
      }}
    />
  );
}
