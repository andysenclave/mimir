// MM-049 — Lesson reading view.
// Prompt 30 (screen scaffold): thin wiring; all logic in useLesson hook.

import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { BackHeader } from '@/components/layout/BackHeader';
import { ErrorState } from '@/components/layout/ErrorState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useLesson } from '@/features/learn/hooks/useLesson';
import { LessonSkeleton } from '@/features/learn/LearnSkeletons';
import { LessonContent } from '@/features/learn/LessonContent';
import { useCourseDetailQuery } from '@/graphql/generated';

export default function LessonViewScreen(): React.JSX.Element {
  const { id: courseId, lessonId } = useLocalSearchParams<{ id: string; lessonId: string }>();

  const { data, loading } = useCourseDetailQuery({
    variables: { id: courseId ?? '' },
    fetchPolicy: 'cache-first',
  });

  const lesson = data?.course.lessons.find((l) => l.id === lessonId) ?? null;
  const { scrolledToEnd, completing, completed, markComplete, onScrollEnd } = useLesson(
    lessonId ?? '',
  );

  const scrollRef = useRef<ScrollView>(null);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>): void {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (nearEnd) onScrollEnd();
  }

  if (loading && lesson === null) {
    return (
      <ScreenContainer>
        <LessonSkeleton />
      </ScreenContainer>
    );
  }

  if (lesson === null) {
    return <ErrorState message="Couldn't load lesson." onRetry={() => router.back()} />;
  }

  const alreadyDone = lesson.completed || completed;

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <BackHeader />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4 gap-4">
          <Text className="text-xl font-bold text-text-primary">{lesson.title}</Text>
          <Text className="text-xs text-text-tertiary">{lesson.readTimeMin} min read</Text>

          <LessonContent content={lesson.content} />

          <Text className="text-xs text-text-tertiary text-center mt-2">
            Educational simulation. Not investment advice.
          </Text>

          <View className="mt-2">
            {alreadyDone ? (
              <View className="items-center py-3">
                <Text className="text-gain text-sm font-medium">Lesson complete</Text>
              </View>
            ) : (
              <Button
                onPress={() => void markComplete()}
                loading={completing}
                disabled={!scrolledToEnd && !alreadyDone}
              >
                {scrolledToEnd ? 'Mark as complete' : 'Read to the end to complete'}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
