// (legal) route group — Terms, Privacy. Public, no auth gating.
// Reachable from signup attestations and from Profile > Privacy (added later).

import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { tokens } from '@/theme/tokens';

export default function LegalLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: tokens.bg.primary },
        headerTintColor: tokens.text.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: tokens.bg.primary },
        headerTitleStyle: { fontWeight: '600' },
        // Reachable from Profile/onboarding (cross-group) — the native back button
        // doesn't render for a group's first screen, so provide one explicitly.
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
            <ArrowLeft color={tokens.text.primary} size={24} strokeWidth={1.75} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
    </Stack>
  );
}
