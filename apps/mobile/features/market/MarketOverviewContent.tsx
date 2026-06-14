// Market Overview screen content — composes all sub-sections (MM-024, MM-074).
// Prompt 20 (screen-composition-srp): this component is the content assembler only.
// Data fetching lives in useMarketOverview; routing lives in app/(tabs)/market.tsx.
//
// Layout (v2 mockup): header (NSE Live status) → Overview/Stocks/Sectors tabs →
// [Overview] search + Indian indices → sectors → performance → top movers.
// Global Markets cards are deferred — the backend does not yet return global
// index quotes (S&P 500 / NASDAQ); see MM-074 notes. Stocks/Sectors deep tabs
// are deferred per plan §5.4 (F-20) and show a placeholder.

import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { GlobalMarketsCards } from './GlobalMarketsCards';
import { useStockSearch } from './hooks/useStockSearch';
import { IndianIndicesCards } from './IndianIndicesCards';
import { MarketComingSoon } from './MarketComingSoon';
import { MarketHeader } from './MarketHeader';
import { MarketTabs, type MarketTab } from './MarketTabs';
import { PerformanceBenchmarkCard } from './PerformanceBenchmarkCard';
import { SectorHeatmap } from './SectorHeatmap';
import { StockSearchBar } from './StockSearchBar';
import { StockSearchResults } from './StockSearchResults';
import { TopMoversList } from './TopMoversList';

import type { MarketOverviewData } from './hooks/useMarketOverview';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface MarketOverviewContentProps {
  overview: MarketOverviewData;
  isOpen: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function MarketOverviewContent({
  overview,
  isOpen,
  refreshing,
  onRefresh,
}: MarketOverviewContentProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const search = useStockSearch();
  const [tab, setTab] = useState<MarketTab>('overview');

  return (
    <ScreenContainer>
      <MarketHeader fetchedAt={overview.fetchedAt} isOpen={isOpen} />
      <MarketTabs active={tab} onChange={setTab} />

      {tab !== 'overview' ? (
        <MarketComingSoon label={tab === 'stocks' ? 'Stocks' : 'Sectors'} />
      ) : (
        <>
          {/* Stock search — always available; results replace the overview while active */}
          <StockSearchBar query={search.query} onChange={search.setQuery} onClear={search.clear} />

          {search.active ? (
            <StockSearchResults
              results={search.results}
              loading={search.loading}
              query={search.debouncedQuery}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={tokens.accent}
                />
              }
              contentContainerStyle={{ paddingVertical: 16, gap: 24 }}
            >
              {/* Global markets — S&P 500 / NASDAQ */}
              <GlobalMarketsCards indices={overview.globalIndices} />

              {/* Indian indices — NIFTY 50 / BANK NIFTY / SENSEX */}
              <IndianIndicesCards indices={overview.indices} />

              {/* Sector heatmap — 10 NSE sectors, tinted by daily move */}
              <SectorHeatmap sectors={overview.sectors} />

              {/* Performance vs benchmarks — MM-025 */}
              <PerformanceBenchmarkCard />

              {/* Top movers — top 5 gainers + top 5 losers */}
              <TopMoversList gainers={overview.topGainers} losers={overview.topLosers} />

              <View className="h-4" />
            </ScrollView>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
