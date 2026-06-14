// MM-036 — Loading skeleton for the Profile tab.
// Shape matches real layout to avoid shift on data load (MOCKUPS-SCOPED.md Gap 6).

import { View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProfileSkeleton(): React.JSX.Element {
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* User card */}
      <View className="flex-row items-center gap-4 px-4 py-5">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3.5 w-48 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </View>
      </View>

      {/* Stats row */}
      <View className="mx-4 rounded-2xl bg-surface-elevated p-4 gap-3">
        <View className="flex-row gap-2">
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
        </View>
        <View className="flex-row gap-2">
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
          <Skeleton className="flex-1 h-12 rounded-lg" />
        </View>
      </View>

      {/* Watchlist */}
      <View className="mx-4 mt-4 rounded-2xl bg-surface-elevated overflow-hidden">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-row items-center justify-between px-4 py-4 border-b border-border-subtle"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
