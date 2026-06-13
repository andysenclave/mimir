// MM-055 — quiz results: score circle, answer review, Done/Retake.
// All numeric values (X/N, percentage) in mono font per CLAUDE.md §14.

import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { AnsweredQuestion, QuizResult } from '@/features/learn/hooks/useQuiz';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

interface QuizResultsProps {
  result: QuizResult;
  answered: AnsweredQuestion[];
  onRetake: () => void;
}

export function QuizResults({ result, answered, onRetake }: QuizResultsProps): React.JSX.Element {
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-4 pt-6 gap-6">
          {/* Score circle */}
          <View className="items-center gap-2">
            <View className="h-36 w-36 rounded-full border-4 border-accent items-center justify-center">
              <Text className="text-4xl font-mono font-bold text-text-primary">
                {result.correct}/{result.total}
              </Text>
            </View>
            <Text className="text-sm text-text-secondary">
              {result.correct} of {result.total} correct
            </Text>
            <Text className="text-xs font-mono text-text-tertiary">{result.score}%</Text>
          </View>

          {/* Answer review */}
          <View className="gap-3">
            <Text className="text-sm font-medium uppercase tracking-widest text-text-tertiary">
              Review
            </Text>
            {answered.map((a, i) => {
              const correct = a.selectedIndex === a.feedback.correctIndex;
              return (
                <View
                  key={a.questionId}
                  className="rounded-xl border border-border-subtle bg-bg-secondary p-4 gap-2"
                >
                  <Text className="text-sm font-semibold leading-5 text-text-primary">
                    {i + 1}. {a.question}
                  </Text>
                  <Text className={`text-sm ${correct ? 'text-gain' : 'text-loss'}`}>
                    Your answer: {a.options[a.selectedIndex] ?? '—'}
                  </Text>
                  {!correct && (
                    <Text className="text-sm text-gain">
                      Correct answer: {a.options[a.feedback.correctIndex] ?? '—'}
                    </Text>
                  )}
                  <Text className="text-xs leading-5 text-text-tertiary">
                    {a.feedback.explanation}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* CTAs */}
          <View className="gap-2.5">
            <Pressable
              onPress={() => router.back()}
              className="rounded-xl bg-accent py-3.5 items-center active:opacity-80"
            >
              <Text className="text-base font-semibold text-text-primary">Done</Text>
            </Pressable>
            <Pressable
              onPress={onRetake}
              className="rounded-xl border border-border-default py-3.5 items-center active:opacity-70"
            >
              <Text className="text-base font-semibold text-text-secondary">Retake</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
