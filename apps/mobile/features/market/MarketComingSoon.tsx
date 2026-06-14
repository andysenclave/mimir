// Placeholder for the Stocks / Sectors tabs (MM-074).
// The deep Stocks & Sectors views are deferred to Month 2+ (plan §5.4 F-20);
// the tab chrome exists for parity with the v2 mockup, with a clear placeholder.

import { LineChart } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface MarketComingSoonProps {
  label: string;
}

export function MarketComingSoon({ label }: MarketComingSoonProps): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="bg-bg-secondary mb-4 h-14 w-14 items-center justify-center rounded-2xl">
        <LineChart size={24} color={tokens.text.tertiary} strokeWidth={1.75} />
      </View>
      <Text className="text-text-primary text-base font-semibold">{label} — coming soon</Text>
      <Text className="text-text-tertiary mt-1 text-center text-sm">
        Deep {label.toLowerCase()} views arrive in a future update. For now, explore the Overview
        tab.
      </Text>
    </View>
  );
}
