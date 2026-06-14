// MM-062 — loading skeletons for the Learn area.
// Match the real layouts (no shift on load) using the shared Skeleton primitive
// instead of raw bg boxes. One file holds the learn-tab + course + lesson + quiz
// skeletons since they're small and share the same shapes.

import { View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';

/** Learn tab — "For you" suggestion cards + course list. */
export function LearnListSkeleton(): React.JSX.Element {
  return (
    <View className="gap-3">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </View>
  );
}

/** Course detail — header + progress + lesson rows + quiz row. */
export function CourseDetailSkeleton(): React.JSX.Element {
  return (
    <View className="px-4 pt-4 gap-4">
      <View className="gap-2">
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-md" />
      </View>
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-1.5 w-full rounded-full" />
      <View className="mt-2 gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </View>
    </View>
  );
}

/** Lesson reading view — title + body lines. */
export function LessonSkeleton(): React.JSX.Element {
  return (
    <View className="px-4 pt-4 gap-3">
      <Skeleton className="h-6 w-3/5 rounded-lg" />
      <View className="mt-4 gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md" />
        ))}
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </View>
    </View>
  );
}

/** Quiz — progress bar + question + 4 option rows. */
export function QuizSkeleton(): React.JSX.Element {
  return (
    <View className="px-4 pt-4 gap-4">
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-6 w-56 rounded-lg" />
      <View className="mt-2 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </View>
    </View>
  );
}
