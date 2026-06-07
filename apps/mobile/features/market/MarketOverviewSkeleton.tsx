// Skeleton loading state for the Market Overview screen.
// MOCKUPS-SCOPED.md Gap 10: skeleton shapes must match real layout exactly.
// Sections: ticker bar, sector heatmap, top movers (gainers + losers).

import { ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

// ─── Ticker bar ───────────────────────────────────────────────────────────────

function TickerBarSkeleton(): React.JSX.Element {
  return (
    <View className="border-b border-border-subtle bg-bg-secondary px-4 py-3">
      <View className="flex-row gap-5">
        <Skeleton width={90} height={14} />
        <Skeleton width={90} height={14} />
        <Skeleton width={90} height={14} />
      </View>
    </View>
  );
}

// ─── Sector heatmap ───────────────────────────────────────────────────────────

function SectorHeatmapSkeleton(): React.JSX.Element {
  return (
    <View className="px-4">
      <Skeleton width={56} height={14} className="mb-3" />
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          // Static list — index key is intentional here (no reordering).
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} className="flex-1 basis-[46%]" height={54} />
        ))}
      </View>
    </View>
  );
}

// ─── Top movers ───────────────────────────────────────────────────────────────

function MoverSectionSkeleton(): React.JSX.Element {
  return (
    <View className="rounded-xl bg-bg-secondary px-4 pb-2 pt-3">
      <Skeleton width={60} height={12} className="mb-3" />
      <View className="h-px bg-border-subtle mb-2" />
      {Array.from({ length: 5 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={i} className="flex-row items-center justify-between py-3">
          <View className="gap-1.5">
            <Skeleton width={64} height={13} />
            <Skeleton width={96} height={11} />
          </View>
          <View className="items-end gap-1.5">
            <Skeleton width={72} height={13} />
            <Skeleton width={44} height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

function TopMoversListSkeleton(): React.JSX.Element {
  return (
    <View className="px-4">
      <Skeleton width={80} height={14} className="mb-3" />
      <View className="gap-3">
        <MoverSectionSkeleton />
        <MoverSectionSkeleton />
      </View>
    </View>
  );
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function MarketOverviewSkeleton(): React.JSX.Element {
  return (
    <ScreenContainer>
      <TickerBarSkeleton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, gap: 24 }}
      >
        <SectorHeatmapSkeleton />
        <TopMoversListSkeleton />
      </ScrollView>
    </ScreenContainer>
  );
}
