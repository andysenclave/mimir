// MM-048 — Course detail screen.
// Prompt 30 (screen scaffold): thin wiring of hook + feature components.

import { router, useLocalSearchParams } from 'expo-router';
import { GraduationCap, Lock } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BackHeader } from '@/components/layout/BackHeader';
import { ErrorState } from '@/components/layout/ErrorState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useCourseDetail } from '@/features/learn/hooks/useCourseDetail';
import { CourseDetailSkeleton } from '@/features/learn/LearnSkeletons';
import { LessonRow } from '@/features/learn/LessonRow';
import { tokens } from '@/theme/tokens';

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function CourseDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { course, loading, error, refetch } = useCourseDetail(id ?? '');

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

  return (
    <ScreenContainer>
      <BackHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4 gap-4">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-2xl font-bold text-text-primary">{course.title}</Text>
            <Text className="text-sm text-text-tertiary">
              {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty} · {course.totalTimeMin} min
            </Text>
          </View>

          <Text className="text-sm leading-5 text-text-secondary">{course.description}</Text>

          {/* Progress */}
          <View className="gap-1.5">
            <View className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: total > 0 ? `${Math.round((done / total) * 100)}%` : '0%' }}
              />
            </View>
            <Text className="text-xs text-text-tertiary">
              {isComplete ? 'Course complete' : `${done} of ${total} lessons`}
            </Text>
          </View>

          {/* Lessons */}
          <View className="border border-border-subtle rounded-xl bg-bg-secondary px-4 divide-y divide-border-subtle">
            {course.lessons.map((lesson, i) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                onPress={() => router.push(`/course/${course.id}/lesson/${lesson.id}`)}
              />
            ))}
          </View>

          {/* Quiz row — locked until all lessons done; navigates to the quiz when unlocked (MM-054) */}
          <Pressable
            disabled={!quizUnlocked}
            onPress={() => router.push(`/course/${course.id}/quiz`)}
            className={`flex-row items-center gap-3 px-4 py-3 rounded-xl border ${
              quizUnlocked
                ? 'border-accent bg-accent/10 active:opacity-70'
                : 'border-border-subtle bg-bg-secondary opacity-50'
            }`}
          >
            {quizUnlocked ? (
              <GraduationCap size={20} color={tokens.accent} strokeWidth={1.75} />
            ) : (
              <Lock size={20} color={tokens.text.tertiary} strokeWidth={1.75} />
            )}
            <View>
              <Text className={`text-sm font-medium ${quizUnlocked ? 'text-accent' : 'text-text-tertiary'}`}>
                Quiz
                {course.progress?.quizScore !== null && course.progress?.quizScore !== undefined && (
                  <Text className="font-mono"> · best {course.progress.quizScore}%</Text>
                )}
              </Text>
              <Text className="text-xs text-text-tertiary">
                {quizUnlocked ? 'Ready to test your knowledge' : 'Complete all lessons to unlock'}
              </Text>
            </View>
          </Pressable>

          <Text className="text-xs text-text-tertiary text-center">
            Educational simulation. Not investment advice.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
