// MM-036 — Settings section: entry points for sub-screens + sign out.
// MM-059 — sign out opens a confirmation bottom sheet (via SheetProvider), not a native Alert.

import { useRouter } from 'expo-router';
import { Bell, ChevronRight, LogOut, Shield, SlidersHorizontal, User } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';

import { useSheet } from '@/features/sheets/SheetProvider';
import { useAuth } from '@/lib/auth/AuthProvider';
import { tokens } from '@/theme/tokens';

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
  const { openSheet } = useSheet();

  const confirmSignOut = (): void => {
    openSheet({ type: 'signOut', onConfirm: () => signOut() });
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
          icon={<SlidersHorizontal color={tokens.text.secondary} size={18} strokeWidth={1.75} />}
          label="Trading Preferences"
          onPress={() => router.push('/profile/trading-preferences')}
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
