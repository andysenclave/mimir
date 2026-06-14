// MM-036 — Top-3 watchlist preview.
// MM-037 — Alert toggle + remove from watchlist.
// Live LTP via stockPrice subscription in useProfile.

import { formatINR } from '@mimir/shared';
import { router, useRouter } from 'expo-router';
import { Eye, Plus } from 'lucide-react-native';
import { View, Text, Pressable, Switch } from 'react-native';

import type { WatchlistItem } from './hooks/useProfile';

import { EmptyState } from '@/components/layout/EmptyState';
import {
  useRemoveFromWatchlistMutation,
  useToggleWatchlistAlertMutation,
} from '@/graphql/generated';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface ProfileWatchlistSectionProps {
  watchlist: WatchlistItem[];
  onWatchlistChanged: () => void;
}

interface WatchlistRowProps {
  item: WatchlistItem;
  onRemove: (symbol: string) => void;
  onToggleAlert: (symbol: string, enabled: boolean) => void;
}

function WatchlistRow({ item, onRemove, onToggleAlert }: WatchlistRowProps): React.JSX.Element {
  const router = useRouter();
  const isPositive = (item.changePct ?? 0) >= 0;
  const changeColor = isPositive ? 'text-gain' : 'text-loss';
  const changeSign = isPositive ? '+' : '';

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-subtle">
      {/* Tap → invest screen */}
      <Pressable
        onPress={() =>
          router.push({ pathname: '/invest/[symbol]', params: { symbol: item.symbol } })
        }
        className="flex-1 active:opacity-70"
      >
        <Text className="text-sm font-semibold text-text-primary">{item.symbol}</Text>
        {item.ltp !== undefined && item.ltp !== null ? (
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-sm font-mono text-text-primary">{formatINR(item.ltp)}</Text>
            {item.changePct !== undefined && item.changePct !== null && (
              <Text className={`text-xs font-mono ${changeColor}`}>
                {changeSign}
                {item.changePct.toFixed(2)}%
              </Text>
            )}
          </View>
        ) : (
          <Text className="text-xs text-text-tertiary mt-0.5">Price unavailable</Text>
        )}
      </Pressable>

      {/* Alert toggle */}
      <Switch
        value={item.alertEnabled}
        onValueChange={(v) => onToggleAlert(item.symbol, v)}
        accessibilityLabel={`Price alerts for ${item.symbol}`}
      />

      {/* Remove button */}
      <Pressable
        onPress={() => onRemove(item.symbol)}
        hitSlop={8}
        className="ml-3 active:opacity-60"
        accessibilityLabel={`Remove ${item.symbol} from watchlist`}
      >
        <Text className="text-loss text-xs font-medium">Remove</Text>
      </Pressable>
    </View>
  );
}

function WatchlistHeader(): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-text-tertiary text-xs font-medium uppercase tracking-wide">
        Watchlist
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/market' as never)}
        accessibilityRole="button"
        accessibilityLabel="Add stocks to your watchlist"
        className="flex-row items-center gap-1 active:opacity-70"
      >
        <Plus size={14} color={tokens.accent} />
        <Text className="text-accent text-xs font-medium">Add</Text>
      </Pressable>
    </View>
  );
}

export function ProfileWatchlistSection({
  watchlist,
  onWatchlistChanged,
}: ProfileWatchlistSectionProps): React.JSX.Element {
  const [removeFromWatchlist] = useRemoveFromWatchlistMutation({
    onCompleted: onWatchlistChanged,
    update(cache) {
      cache.evict({ fieldName: 'profile' });
      cache.gc();
    },
  });

  const [toggleWatchlistAlert] = useToggleWatchlistAlertMutation({
    update(cache) {
      cache.evict({ fieldName: 'profile' });
      cache.gc();
    },
  });

  function handleRemove(symbol: string): void {
    void removeFromWatchlist({ variables: { symbol } });
  }

  function handleToggleAlert(symbol: string, enabled: boolean): void {
    void toggleWatchlistAlert({ variables: { symbol, enabled } });
  }

  if (watchlist.length === 0) {
    return (
      <View className="mx-4 mt-4">
        <WatchlistHeader />
        <View className="rounded-2xl bg-surface-elevated">
          <EmptyState
            inline
            icon={Eye}
            heading="No stocks watched yet"
            message="Tap any stock on the Market tab and add it to your watchlist."
          />
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mt-4">
      <WatchlistHeader />
      <View className="rounded-2xl bg-surface-elevated overflow-hidden">
        {watchlist.map((item) => (
          <WatchlistRow
            key={item.symbol}
            item={item}
            onRemove={handleRemove}
            onToggleAlert={handleToggleAlert}
          />
        ))}
      </View>
    </View>
  );
}
