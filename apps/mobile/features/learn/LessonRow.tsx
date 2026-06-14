// MM-048 / MM-075 — Lesson row for the CourseDetail screen.
// States: completed (green check + DONE) · next (accent number + Start) · upcoming (muted number).

import { CheckCircle2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CourseDetailQuery } from '@/graphql/generated';

import { useThemeTokens } from '@/theme/use-theme-tokens';

type LessonItem = CourseDetailQuery['course']['lessons'][number];

interface LessonRowProps {
  lesson: LessonItem;
  index: number;
  /** First incomplete lesson — gets the accent number + "Start" affordance. */
  isNext: boolean;
  onPress: () => void;
}

export function LessonRow({ lesson, index, isNext, onPress }: LessonRowProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const titleColor = isNext ? 'text-accent' : 'text-text-primary';

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 py-3 active:opacity-70">
      {/* Status indicator */}
      {lesson.completed ? (
        <CheckCircle2 size={22} color={tokens.gain} strokeWidth={1.75} />
      ) : (
        <View
          className={`h-[22px] w-[22px] items-center justify-center rounded-full ${
            isNext ? 'bg-accent' : 'border border-border-strong'
          }`}
        >
          <Text
            className={`font-mono text-[11px] font-semibold ${
              isNext ? 'text-white' : 'text-text-tertiary'
            }`}
          >
            {index + 1}
          </Text>
        </View>
      )}

      {/* Title + read time */}
      <View className="flex-1">
        <Text className={`text-sm font-medium ${titleColor}`}>{lesson.title}</Text>
        <Text className="text-text-tertiary mt-0.5 font-mono text-xs">
          {lesson.readTimeMin} min read
        </Text>
      </View>

      {/* Right affordance */}
      {lesson.completed ? (
        <Text className="text-gain text-xs font-semibold uppercase tracking-wide">Done</Text>
      ) : isNext ? (
        <View className="bg-accent rounded-full px-3 py-1">
          <Text className="text-xs font-semibold text-white">Start</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
