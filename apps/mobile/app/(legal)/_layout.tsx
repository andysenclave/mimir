// (legal) route group — Terms, Privacy. Public, no auth gating.
// Reachable from signup attestations and from Profile > Privacy (added later).

import { Stack } from 'expo-router';

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
      }}
    >
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
    </Stack>
  );
}
