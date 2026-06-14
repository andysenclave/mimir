// MM-054/055 — quiz screen.
// Prompt 30 (screen scaffold): thin — wires useQuiz to feature components.
// Phases: loading skeleton → answering (one question at a time, no back-nav)
// → submitting → results (score + answer review + Done/Retake).

import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { BackHeader } from '@/components/layout/BackHeader';
import { ErrorState } from '@/components/layout/ErrorState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useQuiz } from '@/features/learn/hooks/useQuiz';
import { QuizSkeleton } from '@/features/learn/LearnSkeletons';
import { QuizQuestion } from '@/features/learn/QuizQuestion';
import { QuizResults } from '@/features/learn/QuizResults';
import { tokens } from '@/theme/tokens';

export default function QuizScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = useQuiz(id ?? '');

  if (quiz.phase === 'loading') {
    return (
      <ScreenContainer>
        <QuizSkeleton />
      </ScreenContainer>
    );
  }

  if (quiz.phase === 'error') {
    return <ErrorState message="Couldn't load the quiz." onRetry={() => router.back()} />;
  }

  if (quiz.phase === 'results' && quiz.result !== null) {
    return <QuizResults result={quiz.result} answered={quiz.answered} onRetake={quiz.retake} />;
  }

  return (
    <ScreenContainer>
      <BackHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-4 gap-4">
          {/* Header: course title + progress */}
          <View className="gap-2">
            <Text className="text-sm text-text-tertiary" numberOfLines={1}>
              {quiz.courseTitle}
            </Text>
            <View className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
              <View
                className="h-full rounded-full bg-accent"
                style={{
                  width:
                    quiz.totalQuestions > 0
                      ? `${Math.round(((quiz.qIndex + 1) / quiz.totalQuestions) * 100)}%`
                      : '0%',
                }}
              />
            </View>
            <Text className="text-xs font-mono text-text-tertiary">
              {quiz.qIndex + 1}/{quiz.totalQuestions}
            </Text>
          </View>

          {quiz.currentQuestion !== null && (
            <QuizQuestion
              question={quiz.currentQuestion.question}
              options={quiz.currentQuestion.options}
              selectedIndex={quiz.selectedIndex}
              feedback={quiz.feedback}
              onSelect={quiz.selectOption}
            />
          )}

          {/* Next / Finish — disabled until an option is selected and feedback arrived */}
          <Pressable
            disabled={quiz.selectedIndex === null || quiz.feedback === null || quiz.phase === 'submitting'}
            onPress={quiz.next}
            className={`rounded-xl py-3.5 items-center ${
              quiz.selectedIndex === null || quiz.feedback === null
                ? 'bg-bg-tertiary'
                : 'bg-accent active:opacity-80'
            }`}
          >
            {quiz.phase === 'submitting' || quiz.feedbackLoading ? (
              <ActivityIndicator color={tokens.text.primary} />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  quiz.selectedIndex === null || quiz.feedback === null
                    ? 'text-text-tertiary'
                    : 'text-text-primary'
                }`}
              >
                {quiz.isLastQuestion ? 'Finish' : 'Next'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
