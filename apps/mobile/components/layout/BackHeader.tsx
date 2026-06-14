// Shared back-navigation header for pushed (non-tab) screens.
// A visible chevron is needed because the app uses headerShown:false everywhere
// (custom dark headers), so the native back button never renders. router.back()
// pops the root Stack history.

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

interface BackHeaderProps {
  title?: string;
}

export function BackHeader({ title }: BackHeaderProps): React.JSX.Element {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border-subtle">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft color={tokens.text.primary} size={24} strokeWidth={1.75} />
      </Pressable>
      {title !== undefined && (
        <Text className="flex-1 text-base font-semibold text-text-primary" numberOfLines={1}>
          {title}
        </Text>
      )}
    </View>
  );
}
