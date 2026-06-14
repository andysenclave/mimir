// Informational pill shown when market is closed (MOCKUPS-SCOPED.md Gap 9).
// Not an error — shows last-known data with a visual hint that prices are stale.

import { Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

export function MarketClosedPill(): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="flex-row items-center gap-2 self-start rounded-full border border-border-default bg-bg-secondary px-3 py-1.5">
      <Clock size={12} color={tokens.text.tertiary} />
      <Text className="font-sans text-xs text-text-tertiary">
        Market Closed · Opens 9:15 AM IST
      </Text>
    </View>
  );
}
