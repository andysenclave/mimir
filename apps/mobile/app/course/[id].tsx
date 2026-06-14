// MM-048 — Course detail screen.
// Prompt 30 (screen scaffold): thin wiring of hook + feature components.

import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Trophy } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BackHeader } from '@/components/layout/BackHeader';
import { ErrorState } from '@/components/layout/ErrorState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DifficultyBadge } from '@/features/learn/DifficultyBadge';
import { useCourseDetail } from '@/features/learn/hooks/useCourseDetail';
import { CourseDetailSkeleton } from '@/features/learn/LearnSkeletons';
import { LessonRow } from '@/features/learn/LessonRow';
import { useThemeTokens } from '@/theme/use-theme-tokens';

export default function CourseDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { course, loading, error, refetch } = useCourseDetail(id ?? '');
  const tokens = useThemeTokens();

  if (loading && course === null) {
    return (
      <ScreenContainer>
        <CourseDetailSkeleton />
      </ScreenContainer>
    );
  }

  if (error || course === null) {
    return <ErrorState message="Couldn't load course." onRetry={() => void refetch()} />;
  }

  const total = course.lessons.length;
  const done = course.progress?.lessonsComplete ?? 0;
  const isComplete = done >= total && total > 0;
  const quizUnlocked = isComplete;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const nextLessonId = course.lessons.find((l) => !l.completed)?.id;

  return (
    <ScreenContainer>
      <BackHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4 gap-4">
          {/* Header card */}
          <View className="gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-4">
            <View className="items-center gap-2">
              <DifficultyBadge difficulty={course.difficulty} />
              <Text className="text-center text-xl font-bold text-text-primary">
                {course.title}
              </Text>
              <Text className="text-center text-xs text-text-tertiary">
                {total} lessons · ~{course.totalTimeMin} min total
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
                <View className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </View>
              <Text className="text-text-secondary font-mono text-xs">
                {done}/{total}
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-5 text-text-secondary">{course.description}</Text>

          {/* Lessons */}
          <View className="border border-border-subtle rounded-xl bg-bg-secondary px-4 divide-y divide-border-subtle">
            {course.lessons.map((lesson, i) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                isNext={lesson.id === nextLessonId}
                onPress={() => router.push(`/course/${course.id}/lesson/${lesson.id}`)}
              />
            ))}
          </View>

          {/* Quiz row — locked until all lessons done; navigates to the quiz when unlocked (MM-054) */}
          <Pressable
            disabled={!quizUnlocked}
            onPress={() => router.push(`/course/${course.id}/quiz`)}
            className={`flex-row items-center gap-3 px-4 py-3.5 rounded-xl border ${
              quizUnlocked
                ? 'border-accent bg-accent/10 active:opacity-70'
                : 'border-border-subtle bg-bg-secondary'
            }`}
          >
            <Trophy
              size={20}
              color={quizUnlocked ? tokens.warning : tokens.text.tertiary}
              strokeWidth={1.75}
            />
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold ${quizUnlocked ? 'text-text-primary' : 'text-text-tertiary'}`}
              >
                Course Quiz
                {course.progress?.quizScore !== null &&
                  course.progress?.quizScore !== undefined && (
                    <Text className="text-text-secondary font-mono">
                      {' '}
                      · best {course.progress.quizScore}%
                    </Text>
                  )}
              </Text>
              <Text className="text-xs text-text-tertiary">
                {quizUnlocked ? 'Ready to test your knowledge' : 'Complete all lessons to unlock'}
              </Text>
            </View>
            {quizUnlocked ? (
              <View className="rounded-full bg-accent px-3 py-1">
                <Text className="text-xs font-semibold text-white">Start</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-1">
                <Lock size={11} color={tokens.text.tertiary} />
                <Text className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
                  Locked
                </Text>
              </View>
            )}
          </Pressable>

          <Text className="text-xs text-text-tertiary text-center">
            Educational simulation. Not investment advice.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
