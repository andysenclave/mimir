// MM-036 — Settings section: entry points for sub-screens + sign out.
// Sign out shows native Alert for confirmation (MM-059 bottom sheet deferred to Sprint 4).

import { View, Text, Pressable, Alert } from 'react-native';
import { Bell, ChevronRight, LogOut, Shield, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { tokens } from '@/theme/tokens';
import { useAuth } from '@/lib/auth/AuthProvider';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingsRow({ icon, label, onPress, destructive = false }: SettingsRowProps): React.JSX.Element {
  const labelClass = destructive ? 'text-loss' : 'text-text-primary';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-4 border-b border-border-subtle active:bg-surface-hover"
    >
      <View className="w-6 items-center">{icon}</View>
      <Text className={`flex-1 text-sm font-medium ${labelClass}`}>{label}</Text>
      {!destructive && (
        <ChevronRight color={tokens.text.tertiary} size={16} strokeWidth={1.75} />
      )}
    </Pressable>
  );
}

export function ProfileSettingsSection(): React.JSX.Element {
  const router = useRouter();
  const { signOut } = useAuth();

  const confirmSignOut = (): void => {
    Alert.alert(
      'Sign out?',
      "You'll need to sign in again to access your portfolio.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => void signOut(),
        },
      ],
    );
  };

  return (
    <View className="mx-4 mt-4">
      <Text className="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-2">
        Settings
      </Text>
      <View className="rounded-2xl bg-surface-elevated overflow-hidden">
        <SettingsRow
          icon={<User color={tokens.text.secondary} size={18} strokeWidth={1.75} />}
          label="Account"
          onPress={() => router.push('/profile/account')}
        />
        <SettingsRow
          icon={<Bell color={tokens.text.secondary} size={18} strokeWidth={1.75} />}
          label="Notifications"
          onPress={() => router.push('/profile/notifications')}
        />
        <SettingsRow
          icon={<Shield color={tokens.text.secondary} size={18} strokeWidth={1.75} />}
          label="Privacy"
          onPress={() => router.push('/profile/privacy')}
        />
        <Pressable
          onPress={confirmSignOut}
          className="flex-row items-center gap-3 px-4 py-4 active:bg-surface-hover"
        >
          <View className="w-6 items-center">
            <LogOut color={tokens.loss} size={18} strokeWidth={1.75} />
          </View>
          <Text className="flex-1 text-sm font-medium text-loss">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
