// Global Markets cards (MM-077) — horizontal scroll of S&P 500 / NASDAQ.
// Data from marketOverview.globalIndices; hidden when none. Numerics: font-mono.

import clsx from 'clsx';
import { ScrollView, Text, View } from 'react-native';

import type { MarketIndexQuote } from './hooks/useMarketOverview';

interface GlobalMarketsCardsProps {
  indices: MarketIndexQuote[];
}

function formatLtp(ltp: number): string {
  return ltp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function GlobalMarketsCards({ indices }: GlobalMarketsCardsProps): React.JSX.Element | null {
  if (indices.length === 0) return null;

  return (
    <View>
      <Text className="text-text-tertiary mb-2 px-4 text-xs font-medium uppercase tracking-wide">
        Global Markets
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {indices.map((idx) => {
          const positive = idx.changePct >= 0;
          const sign = positive ? '+' : '';
          const tone = positive ? 'text-gain' : 'text-loss';
          return (
            <View
              key={idx.symbol}
              className="w-40 rounded-xl border border-border-subtle bg-bg-secondary p-3"
            >
              <Text className="text-text-tertiary text-[10px] font-medium uppercase tracking-wide">
                US
              </Text>
              <Text className="text-text-primary mt-0.5 text-sm font-semibold" numberOfLines={1}>
                {idx.name}
              </Text>
              <Text className="text-text-primary mt-1.5 font-mono text-base">
                {formatLtp(idx.ltp)}
              </Text>
              <Text className={clsx('mt-0.5 font-mono text-xs', tone)}>
                {sign}
                {idx.changePct.toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
