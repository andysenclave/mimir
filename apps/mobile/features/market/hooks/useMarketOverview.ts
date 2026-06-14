// MM-024 — Market Overview data hook.
// Prompt 16 (state-management-decisions): Apollo owns all server state.
// Prompt 21 (api-client): codegen hooks only — no raw fetch.
//
// Strategy:
//   Query  → initial load + 15s polling during market hours for full overview
//            (indices, sectors, top movers all refresh together).
//   Sub    → stockPrice ticks for top mover symbols only; each tick is
//            written back into the Apollo cache so TopMoversList re-renders
//            without waiting for the next poll cycle.
//
// Types: codegen generates query-scoped types (only selected fields). We derive
// and re-export these so downstream components have a stable, correct contract.

import { isMarketOpen } from '@mimir/shared';
import { useEffect, useMemo, useState } from 'react';

import {
  MarketOverviewDocument,
  useMarketOverviewQuery,
  useStockPriceUpdateSubscription,
  type MarketOverviewQuery,
} from '@/graphql/generated';

// ─── Derived types ────────────────────────────────────────────────────────────
// These represent what the MarketOverview query actually returns (selected
// fields only). Export them so component props stay in sync automatically.

export type MarketOverviewData = NonNullable<MarketOverviewQuery['marketOverview']>;
export type MarketIndexQuote = MarketOverviewData['indices'][number];
export type MarketStockQuote = MarketOverviewData['topGainers'][number];
export type MarketSectorPerf = MarketOverviewData['sectors'][number];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseMarketOverviewResult {
  overview: MarketOverviewData | undefined;
  loading: boolean;
  error: Error | undefined;
  refreshing: boolean;
  isOpen: boolean;
  onRefresh: () => Promise<void>;
}

export function useMarketOverview(): UseMarketOverviewResult {
  // Computed once per render — acceptable for Phase 1. The hook re-runs on
  // every parent re-render and the 15s poll keeps it effectively current.
  const isOpen = isMarketOpen(new Date());

  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch, startPolling, stopPolling } =
    useMarketOverviewQuery({
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  // Start/stop polling based on market hours.
  // startPolling/stopPolling are stable Apollo references — safe in effect.
  useEffect(() => {
    if (isOpen) {
      startPolling(15_000);
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [isOpen, startPolling, stopPolling]);

  const overview = data?.marketOverview;

  // Symbols to subscribe to — only top movers (indices refresh via polling).
  const moverSymbols = useMemo<string[]>(
    () => [
      ...(overview?.topGainers.map((s) => s.symbol) ?? []),
      ...(overview?.topLosers.map((s) => s.symbol) ?? []),
    ],
    [overview],
  );

  // Live ticks for top movers — patch the overview in Apollo cache so the
  // list reflects updated prices before the next poll cycle.
  useStockPriceUpdateSubscription({
    variables: { symbols: moverSymbols },
    skip: !isOpen || moverSymbols.length === 0,
    onData: ({ client, data: subData }) => {
      const tick = subData.data?.stockPrice;
      if (!tick) return;

      const cached = client.readQuery({ query: MarketOverviewDocument });
      if (!cached?.marketOverview) return;

      const applyTick = (stock: MarketStockQuote): MarketStockQuote =>
        stock.symbol === tick.symbol
          ? { ...stock, ltp: tick.ltp, change: tick.change, changePct: tick.changePct }
          : stock;

      client.writeQuery({
        query: MarketOverviewDocument,
        data: {
          marketOverview: {
            ...cached.marketOverview,
            topGainers: cached.marketOverview.topGainers.map(applyTick),
            topLosers: cached.marketOverview.topLosers.map(applyTick),
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
    overview,
    loading,
    error: error as Error | undefined,
    refreshing,
    isOpen,
    onRefresh,
  };
}
