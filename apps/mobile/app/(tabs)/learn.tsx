// MM-047 — Learn tab. Replaces Phase 1 placeholder.
// Prompt 30 (screen scaffold): thin — hooks wire data to feature components.

import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ErrorState } from '@/components/layout/ErrorState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { CourseCard } from '@/features/learn/CourseCard';
import { useAISuggestions } from '@/features/learn/hooks/useAISuggestions';
import { useLearnHub } from '@/features/learn/hooks/useLearnHub';
import { LearnListSkeleton } from '@/features/learn/LearnSkeletons';
import { SuggestionCard } from '@/features/learn/SuggestionCard';
import { TodaysConceptCard } from '@/features/learn/TodaysConceptCard';

export default function LearnTab(): React.JSX.Element {
  const { courses, todaysConcept, loading, error, refetch } = useLearnHub();
  const {
    suggestions,
    loading: suggestionsLoading,
    onSuggestionPress,
  } = useAISuggestions();

  if (error && courses.length === 0) {
    return <ErrorState message="Couldn't load courses." onRetry={() => void refetch()} />;
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 pt-4 gap-5">
          <Text className="text-2xl font-bold text-text-primary">Learn</Text>

          {todaysConcept !== null && (
            <TodaysConceptCard title={todaysConcept.title} body={todaysConcept.body} />
          )}

          {/* AI suggestions — hidden entirely on error or empty (MM-052) */}
          {suggestionsLoading && suggestions.length === 0 ? (
            <LearnListSkeleton />
          ) : suggestions.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm font-medium uppercase tracking-widest text-text-tertiary">
                For you
              </Text>
              <View className="gap-3">
                {suggestions.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    title={s.title}
                    body={s.body}
                    ctaLink={s.ctaLink}
                    onPress={() => onSuggestionPress(s.ctaLink)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="text-sm font-medium uppercase tracking-widest text-text-tertiary">
              Courses
            </Text>
            {loading && courses.length === 0 ? (
              <View className="gap-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </View>
            ) : (
              <View className="gap-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onPress={() => router.push(`/course/${course.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          <Text className="text-xs text-text-tertiary text-center">
            Educational simulation. Not investment advice.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
