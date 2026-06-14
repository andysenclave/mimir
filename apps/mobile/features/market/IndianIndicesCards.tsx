// Indian indices cards (MM-074) — NIFTY 50 / BANK NIFTY / SENSEX as cards.
// Replaces the compact ticker bar with the card layout from the v2 mockup.
// All numerics: font-mono per CLAUDE.md §14.

import clsx from 'clsx';
import { Text, View } from 'react-native';

import type { MarketIndexQuote } from './hooks/useMarketOverview';

interface IndianIndicesCardsProps {
  indices: MarketIndexQuote[];
}

function formatLtp(ltp: number): string {
  return ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexCard({ index }: { index: MarketIndexQuote }): React.JSX.Element {
  const positive = index.changePct >= 0;
  const sign = positive ? '+' : '';
  const tone = positive ? 'text-gain' : 'text-loss';

  return (
    <View className="bg-bg-secondary flex-1 rounded-xl border border-border-subtle p-3">
      <Text
        className="text-text-tertiary text-[11px] font-medium uppercase tracking-wide"
        numberOfLines={1}
      >
        {index.name}
      </Text>
      <Text className="text-text-primary mt-1.5 font-mono text-base font-semibold">
        {formatLtp(index.ltp)}
      </Text>
      <View className="mt-1 flex-row items-center gap-1.5">
        <Text className={clsx('font-mono text-xs', tone)}>
          {sign}
          {index.change.toFixed(2)}
        </Text>
        <Text className={clsx('font-mono text-xs', tone)}>
          {sign}
          {index.changePct.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

export function IndianIndicesCards({ indices }: IndianIndicesCardsProps): React.JSX.Element | null {
  if (indices.length === 0) return null;
  return (
    <View className="px-4">
      <Text className="text-text-tertiary mb-2 text-xs font-medium uppercase tracking-wide">
        Indian Indices
      </Text>
      <View className="flex-row gap-2">
        {indices.map((index) => (
          <IndexCard key={index.symbol} index={index} />
        ))}
      </View>
    </View>
  );
}
