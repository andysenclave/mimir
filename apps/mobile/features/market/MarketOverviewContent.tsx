// Market Overview screen content — composes all sub-sections.
// Prompt 20 (screen-composition-srp): this component is the content assembler only.
// Data fetching lives in useMarketOverview; routing lives in app/(tabs)/market.tsx.

import { RefreshControl, ScrollView, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import type { MarketOverviewData } from './hooks/useMarketOverview';

import { IndexTickerBar } from './IndexTickerBar';
import { MarketClosedPill } from './MarketClosedPill';
import { PerformanceBenchmarkCard } from './PerformanceBenchmarkCard';
import { SectorHeatmap } from './SectorHeatmap';
import { TopMoversList } from './TopMoversList';

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
  return (
    <ScreenContainer>
      {/* Live ticker bar — pinned above the scroll area */}
      <IndexTickerBar indices={overview.indices} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
        contentContainerStyle={{ paddingVertical: 20, gap: 24 }}
      >
        {/* Market Closed pill — only visible off-hours */}
        {!isOpen && (
          <View className="px-4">
            <MarketClosedPill />
          </View>
        )}

        {/* Sector heatmap — 10 NSE sectors */}
        <SectorHeatmap sectors={overview.sectors} />

        {/* Top movers — top 5 gainers + top 5 losers */}
        <TopMoversList gainers={overview.topGainers} losers={overview.topLosers} />

        {/* Performance vs benchmarks — MM-025 */}
        <PerformanceBenchmarkCard />

        <View className="h-4" />
      </ScrollView>
    </ScreenContainer>
  );
}
