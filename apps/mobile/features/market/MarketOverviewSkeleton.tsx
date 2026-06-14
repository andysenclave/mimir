// Skeleton loading state for the Market Overview screen.
// MOCKUPS-SCOPED.md Gap 10: skeleton shapes must match real layout exactly.
// Sections: ticker bar, sector heatmap, top movers (gainers + losers).

import { ScrollView, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Header + tabs ──────────────────────────────────────────────────────────

function HeaderSkeleton(): React.JSX.Element {
  return (
    <View className="px-4 pb-3 pt-2">
      <Skeleton width={110} height={26} />
      <Skeleton width={170} height={12} className="mt-2" />
      <View className="mt-3 flex-row gap-2">
        <Skeleton width={84} height={30} className="rounded-full" />
        <Skeleton width={72} height={30} className="rounded-full" />
        <Skeleton width={76} height={30} className="rounded-full" />
      </View>
    </View>
  );
}

// ─── Indian indices ───────────────────────────────────────────────────────────

const INDEX_CARDS = ['i1', 'i2', 'i3'] as const;

function IndicesSkeleton(): React.JSX.Element {
  return (
    <View className="px-4">
      <Skeleton width={96} height={12} className="mb-2" />
      <View className="flex-row gap-2">
        {INDEX_CARDS.map((c) => (
          <Skeleton key={c} className="flex-1" height={74} />
        ))}
      </View>
    </View>
  );
}

// ─── Sector heatmap ───────────────────────────────────────────────────────────

// Fixed-length placeholder rows. Stable semantic keys avoid index-based keys
// for a static, never-reordered list.
const HEATMAP_TILES = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'] as const;

function SectorHeatmapSkeleton(): React.JSX.Element {
  return (
    <View className="px-4">
      <Skeleton width={56} height={14} className="mb-3" />
      <View className="flex-row flex-wrap gap-2">
        {HEATMAP_TILES.map((tile) => (
          <Skeleton key={tile} className="flex-1 basis-[46%]" height={54} />
        ))}
      </View>
    </View>
  );
}

// ─── Top movers ───────────────────────────────────────────────────────────────

// Fixed-length placeholder rows — stable semantic keys, no index keys.
const MOVER_ROWS = ['r1', 'r2', 'r3', 'r4', 'r5'] as const;

function MoverSectionSkeleton(): React.JSX.Element {
  return (
    <View className="rounded-xl bg-bg-secondary px-4 pb-2 pt-3">
      <Skeleton width={60} height={12} className="mb-3" />
      <View className="h-px bg-border-subtle mb-2" />
      {MOVER_ROWS.map((row) => (
        <View key={row} className="flex-row items-center justify-between py-3">
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
      <HeaderSkeleton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16, gap: 24 }}
      >
        <IndicesSkeleton />
        <SectorHeatmapSkeleton />
        <TopMoversListSkeleton />
      </ScrollView>
    </ScreenContainer>
  );
}
