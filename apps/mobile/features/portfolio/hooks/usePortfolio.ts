// usePortfolio — MM-030 + MM-031.
// Prompt 16: Apollo owns all server state.
// Query: initial load + pull-to-refresh.
// Subscription (MM-031): live P&L ticks — patches query cache directly.
//   • subscribe only when Portfolio screen is focused (useFocusEffect)
//   • unsubscribes automatically on blur (subscription cleanup in useEffect return)

import { isMarketOpen } from '@mimir/shared';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import {
  PortfolioDocument,
  usePortfolioQuery,
  usePortfolioUpdateSubscription,
  type PortfolioQuery,
} from '@/graphql/generated';


export type PortfolioData = NonNullable<PortfolioQuery['portfolio']>;
export type PortfolioHolding = PortfolioData['holdings'][number];
export type EquityPoint = PortfolioData['equityCurve'][number];

export interface UsePortfolioResult {
  portfolio: PortfolioData | undefined;
  loading: boolean;
  error: Error | undefined;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioResult {
  const isOpen = isMarketOpen(new Date());
  const [refreshing, setRefreshing] = useState(false);
  // Track screen focus so we skip the subscription when off-screen
  const [isFocused, setIsFocused] = useState(true);

  // useFocusEffect fires on every focus/blur — standard Expo Router pattern
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => { setIsFocused(false); };
    }, []),
  );

  const { data, loading, error, refetch, client } = usePortfolioQuery({
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // MM-031 — portfolio P&L subscription.
  // Skip when: market closed OR screen not focused.
  // onData patches Apollo cache via writeQuery so every component reading
  // Portfolio re-renders with fresh metrics — no Zustand, no refetch (prompt 16).
  usePortfolioUpdateSubscription({
    skip: !isOpen || !isFocused,
    onData: ({ data: subData }) => {
      const update = subData.data?.portfolioUpdate;
      if (!update) return;

      const cached = client.readQuery({ query: PortfolioDocument });
      if (!cached?.portfolio) return;

      type UpdateHolding = (typeof update.holdings)[number];
      type CachedHolding = (typeof cached.portfolio.holdings)[number];
      const updatedHoldingMap = new Map<string, UpdateHolding>(
        update.holdings.map((h) => [h.symbol, h]),
      );
      const mergedHoldings = cached.portfolio.holdings.map((h: CachedHolding) => {
        const tick = updatedHoldingMap.get(h.symbol);
        if (!tick) return h;
        return {
          ...h,
          ltp: tick.ltp,
          unrealizedPnl: tick.unrealizedPnl,
          unrealizedPnlPct: tick.unrealizedPnlPct,
          totalValue: tick.totalValue,
        };
      });

      client.writeQuery({
        query: PortfolioDocument,
        data: {
          portfolio: {
            ...cached.portfolio,
            holdings: mergedHoldings,
            totalValue: update.totalValue,
            totalInvested: update.totalInvested,
            totalPnl: update.totalPnl,
            totalPnlPct: update.totalPnlPct,
            budget: {
              ...cached.portfolio.budget,
              cashRemaining: update.cashRemaining,
            },
          },
        },
      });
    },
  });

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return {
    portfolio: data?.portfolio,
    loading,
    error: error as Error | undefined,
    refreshing,
    onRefresh,
  };
}
