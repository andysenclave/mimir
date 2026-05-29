// Splash route. Decides where to send the user based on auth + onboarding.
// Per prompt 30: this is the only place that owns the post-load redirect logic.

import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthProvider';

export default function Index(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <View className="flex-1 bg-bg-primary" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.onboardingDone === false) return <Redirect href="/budget" />;
  // MM-014 lands /(tabs)/portfolio. Until then, post-login stub absorbs the
  // landing so the app doesn't 404 on first run.
  return <Redirect href="/post-login" />;
}
