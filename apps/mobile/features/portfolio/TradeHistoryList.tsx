// Trade history tab — FlashList of all orders, newest first.
// MM-038: cursor pagination (load-more) + tap-row detail modal.

import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';

import { TradeDetailModal } from './TradeDetailModal';
import { TradeHistoryRow } from './TradeHistoryRow';

import { EmptyState } from '@/components/layout/EmptyState';
import { useOrderHistoryQuery, type OrderHistoryQuery } from '@/graphql/generated';

type TradeItem = OrderHistoryQuery['orderHistory'][number];

const PAGE_SIZE = 50;

export function TradeHistoryList(): React.JSX.Element {
  const [selectedTrade, setSelectedTrade] = useState<TradeItem | null>(null);
  const [allTrades, setAllTrades] = useState<TradeItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useOrderHistoryQuery({
    variables: { limit: PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
    onCompleted(result) {
      const fetched = result.orderHistory;
      setAllTrades(fetched);
      setHasMore(fetched.length === PAGE_SIZE);
      setCursor(fetched[fetched.length - 1]?.executedAt ?? undefined);
    },
  });

  // Use the allTrades state (populated after first fetch + subsequent load-mores),
  // falling back to the initial query data on first render.
  const trades = allTrades.length > 0 ? allTrades : (data?.orderHistory ?? []);

  async function loadMore(): Promise<void> {
    if (!hasMore || loading || !cursor) return;
    const result = await fetchMore({
      variables: { limit: PAGE_SIZE, cursor },
    });
    const newTrades = result.data.orderHistory;
    setAllTrades((prev) => [...prev, ...newTrades]);
    setHasMore(newTrades.length === PAGE_SIZE);
    setCursor(newTrades[newTrades.length - 1]?.executedAt ?? undefined);
  }

  if (loading && trades.length === 0) {
    return (
      <View className="mt-4 px-4 items-center py-8">
        <Text className="text-text-tertiary text-sm">Loading history…</Text>
      </View>
    );
  }

  if (trades.length === 0) {
    return (
      <View className="mt-4">
        <EmptyState
          inline
          icon={Receipt}
          heading="No trades yet"
          message="Place your first order from the Market tab to see your history here."
          ctaLabel="Browse Market"
          onCtaPress={() => router.replace('/(tabs)/market' as never)}
        />
      </View>
    );
  }

  return (
    <>
      <View className="mt-4">
        <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide px-4 mb-2">
          Trade History ({trades.length}{hasMore ? '+' : ''})
        </Text>
        <View className="bg-surface-elevated rounded-2xl mx-4 overflow-hidden">
          <FlashList
            data={trades}
            keyExtractor={(item: TradeItem) => item.id}
            renderItem={({ item }: { item: TradeItem }) => (
              <Pressable onPress={() => setSelectedTrade(item)}>
                <TradeHistoryRow trade={item} />
              </Pressable>
            )}
            scrollEnabled={false}
          />
          {/* Load-more button — MM-038 cursor pagination */}
          {hasMore && (
            <Pressable
              onPress={loadMore}
              className="py-3.5 items-center border-t border-border-subtle"
            >
              <Text className="text-sm text-text-secondary">
                {loading ? 'Loading…' : 'Load more'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Trade detail modal — MM-038 */}
      <Modal
        visible={selectedTrade !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTrade(null)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setSelectedTrade(null)}
        />
        {selectedTrade !== null && (
          <TradeDetailModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
          />
        )}
      </Modal>
    </>
  );
}
