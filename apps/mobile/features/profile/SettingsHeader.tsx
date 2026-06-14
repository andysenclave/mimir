// MM-058 — shared header for profile settings sub-screens (back chevron + title).

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

export function SettingsHeader({ title }: { title: string }): React.JSX.Element {
  const tokens = useThemeTokens();
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border-subtle">
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <ArrowLeft color={tokens.text.primary} size={22} strokeWidth={1.75} />
      </Pressable>
      <Text className="text-lg font-bold text-text-primary">{title}</Text>
    </View>
  );
}
