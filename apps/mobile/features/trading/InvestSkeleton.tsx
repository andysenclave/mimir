// Loading skeleton for the Invest screen (prompt 10 — loading states).

import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export function InvestSkeleton(): React.JSX.Element {
  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <View className="flex-1 gap-1.5">
          <Skeleton className="w-24 h-5 rounded" />
          <Skeleton className="w-40 h-3 rounded" />
        </View>
      </View>
      {/* Price */}
      <View className="px-4 py-4 gap-2">
        <Skeleton className="w-40 h-9 rounded" />
        <Skeleton className="w-28 h-4 rounded" />
      </View>
      {/* Chart */}
      <View className="px-4 mb-4">
        <Skeleton className="w-full h-20 rounded-lg" />
      </View>
      {/* AI card */}
      <View className="mx-4 mb-4">
        <Skeleton className="w-full h-16 rounded-lg" />
      </View>
      {/* Form */}
      <View className="px-4 gap-4">
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full h-20 rounded-lg" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </View>
    </ScreenContainer>
  );
}
