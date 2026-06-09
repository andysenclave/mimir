// MM-036 — Top-3 watchlist preview. Live LTP via stockPrice subscription in useProfile.
// Empty state shown when user hasn't added any stocks to watchlist yet.

import { View, Text, Pressable } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatINR } from '@mimir/shared';
import { tokens } from '@/theme/tokens';
import type { WatchlistItem } from './hooks/useProfile';

interface ProfileWatchlistSectionProps {
  watchlist: WatchlistItem[];
}

interface WatchlistRowProps {
  item: WatchlistItem;
}

function WatchlistRow({ item }: WatchlistRowProps): React.JSX.Element {
  const router = useRouter();
  const isPositive = (item.changePct ?? 0) >= 0;
  const changeColor = isPositive ? 'text-gain' : 'text-loss';
  const changeSign  = isPositive ? '+' : '';

  return (
    <Pressable
      onPress={() => router.push(`/invest/${item.symbol}`)}
      className="flex-row items-center justify-between px-4 py-3.5 border-b border-border-subtle active:bg-surface-hover"
    >
      <Text className="text-sm font-semibold text-text-primary">{item.symbol}</Text>
      <View className="items-end gap-0.5">
        {item.ltp !== undefined && item.ltp !== null ? (
          <>
            <Text className="text-sm font-mono text-text-primary">{formatINR(item.ltp)}</Text>
            {item.changePct !== undefined && item.changePct !== null && (
              <Text className={`text-xs font-mono ${changeColor}`}>
                {changeSign}{item.changePct.toFixed(2)}%
              </Text>
            )}
          </>
        ) : (
          <Text className="text-sm text-text-tertiary">—</Text>
        )}
      </View>
    </Pressable>
  );
}

export function ProfileWatchlistSection({
  watchlist,
}: ProfileWatchlistSectionProps): React.JSX.Element {
  if (watchlist.length === 0) {
    return (
      <View className="mx-4 mt-4">
        <Text className="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-2">
          Watchlist
        </Text>
        <View className="rounded-2xl bg-surface-elevated px-4 py-8 items-center gap-2">
          <TrendingUp color={tokens.text.tertiary} size={24} strokeWidth={1.5} />
          <Text className="text-sm text-text-secondary font-medium">No stocks watched yet</Text>
          <Text className="text-xs text-text-tertiary text-center">
            Tap any stock on the Market tab and add it to your watchlist.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-4">
      <Text className="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-2">
        Watchlist
      </Text>
      <View className="rounded-2xl bg-surface-elevated overflow-hidden">
        {watchlist.map((item) => (
          <WatchlistRow key={item.symbol} item={item} />
        ))}
      </View>
    </View>
  );
}
