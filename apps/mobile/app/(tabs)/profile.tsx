// MM-014 placeholder — the real Profile screen lands in MM-036 with the
// user card, stats grid, watchlist, and settings menu.
// Sign-out lives here in the real version (MM-059); for now we expose it
// inline so the tab shell is testable end-to-end.

import { LogOut, User as UserIcon } from 'lucide-react-native';
import { Alert, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/AuthProvider';
import { tokens } from '@/theme/tokens';

export default function ProfileTab(): React.JSX.Element {
  const { user, signOut } = useAuth();

  const confirmSignOut = (): void => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-bg-secondary">
          <UserIcon color={tokens.text.tertiary} size={32} strokeWidth={1.5} />
        </View>
        <Text className="text-2xl font-bold text-text-primary">Profile</Text>
        <Text className="mt-2 max-w-xs text-center text-sm text-text-secondary">
          {user?.email !== undefined && user.email.length > 0
            ? `Signed in as ${user.email}.`
            : 'Account details will live here.'}
        </Text>
        <Text className="mt-6 text-xs text-text-tertiary">Lands in MM-036.</Text>

        <View className="mt-12 w-full max-w-xs">
          <Button variant="secondary" onPress={confirmSignOut}>
            <View className="flex-row items-center gap-2">
              <LogOut color={tokens.text.primary} size={16} strokeWidth={1.75} />
              <Text className="font-sans text-base font-semibold text-text-primary">Sign out</Text>
            </View>
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
