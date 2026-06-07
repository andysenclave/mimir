// Empty state — shown when user has no holdings yet.

import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

export function PortfolioEmptyState(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-5">
      <View className="w-16 h-16 rounded-full bg-surface-elevated items-center justify-center">
        <TrendingUp size={32} className="text-text-tertiary" />
      </View>
      <View className="items-center gap-2">
        <Text className="text-text-primary text-lg font-semibold text-center">
          No holdings yet
        </Text>
        <Text className="text-text-secondary text-sm text-center leading-5">
          Browse the market and place your first paper trade to get started.
        </Text>
      </View>
      <Button
        onPress={() => router.replace('/(tabs)/market' as never)}
        variant="primary"
        size="md"
        fullWidth
      >
        Browse Market
      </Button>
      <Text className="text-text-tertiary text-xs text-center">
        Educational simulation. Not investment advice.
      </Text>
    </View>
  );
}
