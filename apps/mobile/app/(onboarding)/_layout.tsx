// (onboarding) route group — post-signup, pre-tabs. Auth-required.
// If user is unauth → redirect to /login. If already onboarded → redirect to home.

import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthProvider';
import { useThemeTokens } from '@/theme/use-theme-tokens';

export default function OnboardingLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();
  const tokens = useThemeTokens();

  if (isLoading) return <View className="flex-1 bg-bg-primary" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.onboardingDone === true) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.bg.primary },
        animation: 'fade',
      }}
    />
  );
}
