// MM-037 — Watchlist toggle button for the invest screen header.
// Reads the current profile watchlist from Apollo cache to determine is-watching state.
// Optimistic update: UI flips immediately; server mutation confirms in background.

import { Pressable } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import {
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useProfileQuery,
} from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

interface WatchlistButtonProps {
  symbol: string;
}

export function WatchlistButton({ symbol }: WatchlistButtonProps): React.JSX.Element {
  const { data } = useProfileQuery({ fetchPolicy: 'cache-only' });
  const isWatching =
    data?.profile.watchlist.some((w) => w.symbol === symbol) ?? false;

  const [addToWatchlist, { loading: adding }] = useAddToWatchlistMutation({
    variables: { symbol },
    // Optimistic: update cache so UI flips without waiting for server.
    optimisticResponse: {
      addToWatchlist: { __typename: 'WatchlistItemGql', symbol, alertEnabled: true, ltp: null, changePct: null },
    },
    update(cache, { data: mutData }) {
      if (!mutData?.addToWatchlist) return;
      // Evict profile so the next profile query re-fetches with the new watchlist.
      cache.evict({ fieldName: 'profile' });
      cache.gc();
    },
  });

  const [removeFromWatchlist, { loading: removing }] = useRemoveFromWatchlistMutation({
    variables: { symbol },
    update(cache) {
      cache.evict({ fieldName: 'profile' });
      cache.gc();
    },
  });

  const loading = adding || removing;

  function handlePress(): void {
    if (loading) return;
    if (isWatching) {
      void removeFromWatchlist();
    } else {
      void addToWatchlist();
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      accessibilityLabel={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
      accessibilityRole="button"
      disabled={loading}
    >
      <Bookmark
        size={22}
        strokeWidth={1.75}
        color={isWatching ? tokens.accent : tokens.text.secondary}
        fill={isWatching ? tokens.accent : 'transparent'}
      />
    </Pressable>
  );
}
