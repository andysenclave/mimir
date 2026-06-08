// Trade history tab — FlashList of all orders, newest first.
// Empty state shown when user has never placed a trade.

import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useOrderHistoryQuery, type OrderHistoryQuery } from '@/graphql/generated';
import { TradeHistoryRow } from './TradeHistoryRow';

type TradeItem = OrderHistoryQuery['orderHistory'][number];

export function TradeHistoryList(): React.JSX.Element {
  const { data, loading } = useOrderHistoryQuery({
    variables: { limit: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const trades = data?.orderHistory ?? [];

  if (loading && trades.length === 0) {
    return (
      <View className="mt-4 px-4 items-center py-8">
        <Text className="text-text-tertiary text-sm">Loading history…</Text>
      </View>
    );
  }

  if (trades.length === 0) {
    return (
      <View className="mt-4 px-4 items-center py-8 gap-2">
        <Text className="text-text-secondary text-sm font-medium">No trades yet</Text>
        <Text className="text-text-tertiary text-xs text-center">
          Place your first order from the Market tab to see your history here.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide px-4 mb-2">
        Trade History ({trades.length})
      </Text>
      <View className="bg-surface-elevated rounded-2xl mx-4 overflow-hidden">
        <FlashList
          data={trades}
          keyExtractor={(item: TradeItem) => item.id}
          renderItem={({ item }: { item: TradeItem }) => <TradeHistoryRow trade={item} />}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
