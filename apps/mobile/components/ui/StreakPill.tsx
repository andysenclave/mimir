// Streak pill (MM-077) — flame + "{n} day streak". Hidden when count is 0.

import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface StreakPillProps {
  count: number;
}

export function StreakPill({ count }: StreakPillProps): React.JSX.Element | null {
  const tokens = useThemeTokens();
  if (count <= 0) return null;
  return (
    <View className="bg-warning/15 flex-row items-center gap-1.5 self-start rounded-full px-3 py-1">
      <Flame size={14} color={tokens.warning} strokeWidth={2} />
      <Text className="text-warning text-xs font-semibold">
        <Text className="font-mono">{count}</Text> day streak
      </Text>
    </View>
  );
}
