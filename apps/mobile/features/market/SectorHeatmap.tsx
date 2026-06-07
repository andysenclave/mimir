// Sector performance grid — 10 NSE sectors, 2-column layout.
// MM-024 subtask 3. Color-coded by daily % change:
//   positive → gain-tinted border + gain text
//   negative → loss-tinted border + loss text
// All % values in font-mono per CLAUDE.md §14.

import { Text, View } from 'react-native';
import clsx from 'clsx';

import type { MarketSectorPerf } from './hooks/useMarketOverview';

interface SectorHeatmapProps {
  sectors: MarketSectorPerf[];
}

function formatChangePct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

interface SectorTileProps {
  sector: MarketSectorPerf;
}

function SectorTile({ sector }: SectorTileProps): React.JSX.Element {
  const positive = sector.changePct >= 0;
  const neutral = Math.abs(sector.changePct) < 0.1;

  return (
    <View
      className={clsx(
        'flex-1 basis-[46%] rounded-lg border px-3 py-3',
        'bg-bg-secondary',
        neutral
          ? 'border-border-subtle'
          : positive
          ? 'border-gain'
          : 'border-loss',
      )}
    >
      <Text className="font-sans text-xs text-text-secondary" numberOfLines={1}>
        {sector.displayName}
      </Text>
      <Text
        className={clsx(
          'mt-1 font-mono text-sm font-medium',
          neutral
            ? 'text-text-secondary'
            : positive
            ? 'text-gain'
            : 'text-loss',
        )}
      >
        {formatChangePct(sector.changePct)}
      </Text>
    </View>
  );
}

export function SectorHeatmap({ sectors }: SectorHeatmapProps): React.JSX.Element {
  return (
    <View className="px-4">
      <Text className="mb-3 font-sans text-sm font-semibold text-text-primary">Sectors</Text>
      <View className="flex-row flex-wrap gap-2">
        {sectors.map((sector) => (
          <SectorTile key={sector.name} sector={sector} />
        ))}
      </View>
    </View>
  );
}
