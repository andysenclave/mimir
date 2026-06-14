// MM-036 — Profile data hook.
// Apollo owns all server state (prompt 16). Subscription for watchlist LTP ticks
// skips when screen is not focused — same useFocusEffect pattern as usePortfolio (MM-031).

import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import {
  useProfileQuery,
  useStockPriceUpdateSubscription,
  type ProfileQuery,
} from '@/graphql/generated';

export type ProfileData = NonNullable<ProfileQuery['profile']>;
export type WatchlistItem = ProfileData['watchlist'][number];

export interface UseProfileResult {
  profile: ProfileData | undefined;
  loading: boolean;
  error: Error | undefined;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => { setIsFocused(false); };
    }, []),
  );

  const { data, loading, error, refetch } = useProfileQuery({
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const watchlistSymbols = data?.profile.watchlist.map((w) => w.symbol) ?? [];

  // Live LTP ticks for watchlist symbols — update in Apollo cache so WatchlistRow re-renders.
  useStockPriceUpdateSubscription({
    variables: { symbols: watchlistSymbols },
    skip: !isFocused || watchlistSymbols.length === 0,
    onData: ({ client: apolloClient, data: subData }) => {
      const tick = subData.data?.stockPrice;
      if (!tick) return;

      // WatchlistItemGql has no ID field so we can't do a targeted cache modify.
      // Evict + GC causes a background re-fetch which returns fresh LTP from the snapshot.
      apolloClient.cache.evict({ fieldName: 'profile' });
      apolloClient.cache.gc();
    },
  });

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return {
    profile: data?.profile,
    loading,
    error: error as Error | undefined,
    refreshing,
    onRefresh,
  };
}
