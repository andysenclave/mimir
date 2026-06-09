// MM-036 — Account settings placeholder (MM-058 fills this in Sprint 4).
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { tokens } from '@/theme/tokens';

export default function AccountSettingsScreen(): React.JSX.Element {
  const router = useRouter();
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border-subtle">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={tokens.text.primary} size={22} strokeWidth={1.75} />
        </Pressable>
        <Text className="text-lg font-bold text-text-primary">Account</Text>
      </View>
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="text-text-secondary text-sm text-center">
          Account settings land in Sprint 4 (MM-058).
        </Text>
      </View>
    </ScreenContainer>
  );
}
