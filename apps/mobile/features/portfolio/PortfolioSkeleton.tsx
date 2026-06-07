// Loading skeleton — matches portfolio screen layout.

import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export function PortfolioSkeleton(): React.JSX.Element {
  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Summary card */}
      <View className="bg-surface-elevated rounded-2xl mx-4 mt-4 p-4 gap-4">
        <View className="gap-1.5">
          <Skeleton className="w-28 h-3 rounded" />
          <Skeleton className="w-44 h-8 rounded" />
        </View>
        <Skeleton className="w-36 h-5 rounded" />
        <View className="h-px bg-border-subtle" />
        <View className="flex-row justify-between">
          <Skeleton className="w-24 h-8 rounded" />
          <Skeleton className="w-24 h-8 rounded" />
        </View>
      </View>

      {/* Equity curve */}
      <View className="mx-4 mt-4 gap-2">
        <Skeleton className="w-32 h-3 rounded" />
        <Skeleton className="w-full h-28 rounded-xl" />
      </View>

      {/* Holdings header */}
      <View className="mt-4 px-4 mb-2">
        <Skeleton className="w-28 h-3 rounded" />
      </View>

      {/* Holding rows */}
      <View className="bg-surface-elevated rounded-2xl mx-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-row items-center justify-between px-4 py-3.5 border-b border-border-subtle">
            <View className="flex-1 gap-1.5">
              <Skeleton className="w-20 h-4 rounded" />
              <Skeleton className="w-32 h-3 rounded" />
            </View>
            <View className="items-end gap-1.5">
              <Skeleton className="w-20 h-4 rounded" />
              <Skeleton className="w-16 h-3 rounded" />
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
