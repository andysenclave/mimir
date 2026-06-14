// MM-037 — Watchlist toggle button for the invest screen header.
// Reads is-watching from the cached Profile.watchlist and toggles it.
//
// The previous version evicted the whole `profile` cache field on toggle, which
// (with the cache-only read here) wiped the very data this button renders from —
// so the icon never reflected the change. We now surgically add/remove the item
// in Profile.watchlist via cache.updateQuery, with optimistic responses so the
// icon flips instantly. cache-first ensures the profile is loaded even if the
// user reaches this screen before visiting the Profile tab.

import { Bookmark } from 'lucide-react-native';
import { Pressable } from 'react-native';

import {
  ProfileDocument,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useProfileQuery,
  type ProfileQuery,
} from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

interface WatchlistButtonProps {
  symbol: string;
}

export function WatchlistButton({ symbol }: WatchlistButtonProps): React.JSX.Element {
  const { data } = useProfileQuery({ fetchPolicy: 'cache-first' });
  const isWatching = data?.profile.watchlist.some((w) => w.symbol === symbol) ?? false;

  const [addToWatchlist, { loading: adding }] = useAddToWatchlistMutation({
    variables: { symbol },
    optimisticResponse: {
      addToWatchlist: {
        __typename: 'WatchlistItemGql',
        symbol,
        alertEnabled: true,
        ltp: null,
        changePct: null,
      },
    },
    update(cache, { data: mutData }) {
      const added = mutData?.addToWatchlist;
      if (!added) return;
      cache.updateQuery<ProfileQuery>({ query: ProfileDocument }, (existing) => {
        if (!existing?.profile) return existing;
        if (existing.profile.watchlist.some((w) => w.symbol === added.symbol)) return existing;
        return {
          ...existing,
          profile: {
            ...existing.profile,
            watchlist: [...existing.profile.watchlist, added],
          },
        };
      });
    },
  });

  const [removeFromWatchlist, { loading: removing }] = useRemoveFromWatchlistMutation({
    variables: { symbol },
    optimisticResponse: { removeFromWatchlist: true },
    update(cache) {
      cache.updateQuery<ProfileQuery>({ query: ProfileDocument }, (existing) => {
        if (!existing?.profile) return existing;
        return {
          ...existing,
          profile: {
            ...existing.profile,
            watchlist: existing.profile.watchlist.filter((w) => w.symbol !== symbol),
          },
        };
      });
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
