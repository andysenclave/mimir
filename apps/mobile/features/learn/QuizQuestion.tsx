// MM-054 — single MCQ with answer feedback.
// Dumb component: visual state derives entirely from props.
// Unselected → neutral; selected correct → green; selected wrong → red, with the
// correct option highlighted green. Explanation shows after any selection.

import { Pressable, Text, View } from 'react-native';

import type { AnswerFeedback } from '@/features/learn/hooks/useQuiz';

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedIndex: number | null;
  feedback: AnswerFeedback | null;
  onSelect: (index: number) => void;
}

function optionClasses(
  index: number,
  selectedIndex: number | null,
  feedback: AnswerFeedback | null,
): string {
  const base = 'rounded-xl border px-4 py-3';
  if (selectedIndex === null || feedback === null) {
    return `${base} border-border-subtle bg-bg-secondary active:opacity-70`;
  }
  if (index === feedback.correctIndex) {
    return `${base} border-gain bg-gain/10`;
  }
  if (index === selectedIndex) {
    return `${base} border-loss bg-loss/10`;
  }
  return `${base} border-border-subtle bg-bg-secondary opacity-50`;
}

function optionTextClasses(
  index: number,
  selectedIndex: number | null,
  feedback: AnswerFeedback | null,
): string {
  if (selectedIndex !== null && feedback !== null) {
    if (index === feedback.correctIndex) return 'text-sm leading-5 font-medium text-gain';
    if (index === selectedIndex) return 'text-sm leading-5 font-medium text-loss';
  }
  return 'text-sm leading-5 text-text-primary';
}

export function QuizQuestion({
  question,
  options,
  selectedIndex,
  feedback,
  onSelect,
}: QuizQuestionProps): React.JSX.Element {
  const answered = selectedIndex !== null;

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold leading-6 text-text-primary">{question}</Text>

      <View className="gap-2.5">
        {options.map((option, i) => (
          <Pressable
            key={i}
            disabled={answered}
            onPress={() => onSelect(i)}
            className={optionClasses(i, selectedIndex, feedback)}
          >
            <Text className={optionTextClasses(i, selectedIndex, feedback)}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {answered && feedback !== null && (
        <View className="rounded-xl border border-border-subtle bg-bg-tertiary p-4 gap-1">
          <Text
            className={`text-sm font-semibold ${
              selectedIndex === feedback.correctIndex ? 'text-gain' : 'text-loss'
            }`}
          >
            {selectedIndex === feedback.correctIndex ? 'Correct' : 'Not quite'}
          </Text>
          <Text className="text-sm leading-5 text-text-secondary">{feedback.explanation}</Text>
        </View>
      )}
    </View>
  );
}
