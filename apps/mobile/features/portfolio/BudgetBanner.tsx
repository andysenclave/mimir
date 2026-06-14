// Monthly-budget banner (MM-073) — shows cash remaining of the monthly budget
// and a "+ Invest" CTA that routes to Market to deploy it.

import { formatINR } from '@mimir/shared';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface BudgetBannerProps {
  cashRemaining: number;
  amount: number;
}

export function BudgetBanner({ cashRemaining, amount }: BudgetBannerProps): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="border-accent/30 bg-accent/10 mx-4 mt-4 flex-row items-center justify-between rounded-2xl border px-4 py-3.5">
      <View className="mr-3 flex-1 gap-0.5">
        <Text className="text-accent text-sm font-semibold">Monthly Budget</Text>
        <Text className="text-text-secondary text-xs">
          <Text className="font-mono">{formatINR(cashRemaining)}</Text> of{' '}
          <Text className="font-mono">{formatINR(amount)}</Text> remaining this month
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/(tabs)/market' as never)}
        accessibilityRole="button"
        accessibilityLabel="Invest your monthly budget"
        className="bg-accent flex-row items-center gap-1 rounded-full py-2 pl-3 pr-4 active:opacity-80"
      >
        <Plus size={16} color={tokens.text.primary} />
        <Text className="text-sm font-semibold text-white">Invest</Text>
      </Pressable>
    </View>
  );
}
