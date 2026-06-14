// MM-075 — compact live ticker on the Profile screen (NIFTY / SENSEX / BANK).
// Reuses the marketOverview query (cache-first); hidden when no indices.

import { Text, View } from 'react-native';

import { useMarketOverviewQuery } from '@/graphql/generated';

const SHORT_NAME: Record<string, string> = {
  'NIFTY 50': 'NIFTY',
  'BANK NIFTY': 'BANK',
  'NIFTY BANK': 'BANK',
  SENSEX: 'SENSEX',
};

export function ProfileLiveTicker(): React.JSX.Element | null {
  const { data } = useMarketOverviewQuery({ fetchPolicy: 'cache-first' });
  const indices = data?.marketOverview?.indices ?? [];
  if (indices.length === 0) return null;

  return (
    <View className="mx-4 mt-4">
      <Text className="text-text-tertiary mb-2 text-xs font-medium uppercase tracking-wide">
        Live Ticker
      </Text>
      <View className="bg-surface-elevated flex-row rounded-2xl px-4 py-3">
        {indices.slice(0, 3).map((idx, i) => {
          const positive = idx.changePct >= 0;
          return (
            <View
              key={idx.symbol}
              className={`flex-1 ${i > 0 ? 'border-l border-border-subtle pl-3' : ''}`}
            >
              <Text className="text-text-tertiary text-[10px] uppercase" numberOfLines={1}>
                {SHORT_NAME[idx.name] ?? idx.name}
              </Text>
              <Text className="text-text-primary mt-0.5 font-mono text-sm">
                {idx.ltp.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
              <Text className={`font-mono text-[11px] ${positive ? 'text-gain' : 'text-loss'}`}>
                {positive ? '+' : ''}
                {idx.changePct.toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
