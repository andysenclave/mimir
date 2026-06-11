// MM-048 — Lesson row for the CourseDetail screen.

import { CheckCircle2, Circle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CourseDetailQuery } from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

type LessonItem = CourseDetailQuery['course']['lessons'][number];

interface LessonRowProps {
  lesson: LessonItem;
  index: number;
  onPress: () => void;
}

export function LessonRow({ lesson, index, onPress }: LessonRowProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
    >
      {lesson.completed ? (
        <CheckCircle2 size={20} color={tokens.gain} strokeWidth={1.75} />
      ) : (
        <Circle size={20} color={tokens.text.tertiary} strokeWidth={1.75} />
      )}
      <View className="flex-1">
        <Text className="text-sm font-medium text-text-primary">
          {index + 1}. {lesson.title}
        </Text>
        <Text className="text-xs text-text-tertiary mt-0.5">{lesson.readTimeMin} min read</Text>
      </View>
    </Pressable>
  );
}
