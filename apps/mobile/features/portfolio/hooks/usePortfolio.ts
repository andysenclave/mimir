// usePortfolio — MM-030 + MM-031.
// Prompt 16: Apollo owns all server state.
// Query: initial load + pull-to-refresh.
// Subscription (MM-031): live P&L ticks — patches query cache directly.

import { useState } from 'react';
import {
  PortfolioDocument,
  usePortfolioQuery,
  usePortfolioUpdateSubscription,
  type PortfolioQuery,
} from '@/graphql/generated';
import { isMarketOpen } from '@mimir/shared';

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

  const { data, loading, error, refetch, client } = usePortfolioQuery({
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // MM-031 — portfolio P&L subscription.
  // On each tick, write updated metrics + holdings directly into the Portfolio
  // query cache so components re-render without a round-trip.
  usePortfolioUpdateSubscription({
    skip: !isOpen,
    onData: ({ data: subData }) => {
      const update = subData.data?.portfolioUpdate;
      if (!update) return;

      const cached = client.readQuery({ query: PortfolioDocument });
      if (!cached?.portfolio) return;

      // Merge updated per-holding metrics into cached holdings array
      type UpdateHolding = (typeof update.holdings)[number];
      type CachedHolding = (typeof cached.portfolio.holdings)[number];
      const updatedHoldingMap = new Map<string, UpdateHolding>(update.holdings.map((h) => [h.symbol, h]));
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
