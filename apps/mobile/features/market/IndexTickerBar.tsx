// Horizontally-scrollable ticker bar: NIFTY 50, SENSEX, BANK NIFTY (+ any others).
// MM-024 subtask 1 — subscription-driven via the parent hook (polling at 15s).
// All numerics: font-mono per CLAUDE.md §14.

import clsx from 'clsx';
import { ScrollView, Text, View } from 'react-native';

import type { MarketIndexQuote } from './hooks/useMarketOverview';

interface IndexTickerBarProps {
  indices: MarketIndexQuote[];
}

function formatLtp(ltp: number): string {
  return ltp.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

interface IndexPillProps {
  index: MarketIndexQuote;
}

function IndexPill({ index }: IndexPillProps): React.JSX.Element {
  const positive = index.changePct >= 0;

  return (
    <View className="flex-row items-center gap-2">
      <Text className="font-sans text-xs font-medium text-text-secondary" numberOfLines={1}>
        {index.name}
      </Text>
      <Text className="font-mono text-xs text-text-primary">{formatLtp(index.ltp)}</Text>
      <Text className={clsx('font-mono text-xs', positive ? 'text-gain' : 'text-loss')}>
        {formatChange(index.changePct)}
      </Text>
    </View>
  );
}

export function IndexTickerBar({ indices }: IndexTickerBarProps): React.JSX.Element {
  return (
    <View className="border-b border-border-subtle bg-bg-secondary">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 20 }}
      >
        {indices.map((index) => (
          <IndexPill key={index.symbol} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}
