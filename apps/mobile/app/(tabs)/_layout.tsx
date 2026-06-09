// (tabs) route group — main authenticated tab shell.
// Auth guard: unauth → /login, onboarding-pending → /budget.
// Tab bar styling routes through tokens (Tabs.screenOptions doesn't accept
// className, so this is the documented exception per prompt 22).

import { Redirect, Tabs } from 'expo-router';
import { BookOpen, LayoutGrid, LineChart, User } from 'lucide-react-native';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthProvider';
import { tokens } from '@/theme/tokens';
import { useStreakSetup } from '@/features/notifications/useStreakSetup';

export default function TabsLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();
  useStreakSetup(); // MM-039 — schedules streak reminder at 8 PM IST if not opened today

  if (isLoading) return <View className="flex-1 bg-bg-primary" />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.onboardingDone === false) return <Redirect href="/budget" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.bg.secondary,
          borderTopColor: tokens.border.subtle,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 6,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text.tertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => (
            <LineChart color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
