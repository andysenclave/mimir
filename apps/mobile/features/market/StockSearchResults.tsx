// Market-tab stock search results. Tapping a row opens the invest/order screen.
// Shown in place of the market overview while a search term is active.

import { formatINR } from '@mimir/shared';
import { router } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';

import type { StockSearchResult } from './hooks/useStockSearch';

import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface StockSearchResultsProps {
  results: StockSearchResult[];
  loading: boolean;
  query: string;
}

export function StockSearchResults({
  results,
  loading,
  query,
}: StockSearchResultsProps): React.JSX.Element {
  if (loading && results.length === 0) {
    return (
      <View className="px-4 pt-2 gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        heading="No matches"
        message={`No tradeable stocks match "${query}". Try a different ticker.`}
      />
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 8 }}
    >
      {results.map((stock) => {
        const pct = stock.changePct ?? 0;
        const pctColor = pct > 0 ? 'text-gain' : pct < 0 ? 'text-loss' : 'text-text-tertiary';
        return (
          <Pressable
            key={stock.symbol}
            onPress={() =>
              router.push({ pathname: '/invest/[symbol]', params: { symbol: stock.symbol } })
            }
            className="flex-row items-center justify-between rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3.5 active:opacity-70"
          >
            <Text className="font-mono text-base font-semibold text-text-primary">
              {stock.symbol}
            </Text>
            <View className="items-end">
              <Text className="font-mono text-sm text-text-primary">
                {stock.ltp > 0 ? formatINR(stock.ltp) : '—'}
              </Text>
              {stock.ltp > 0 && (
                <Text className={`font-mono text-xs ${pctColor}`}>
                  {pct > 0 ? '+' : ''}
                  {pct.toFixed(2)}%
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
