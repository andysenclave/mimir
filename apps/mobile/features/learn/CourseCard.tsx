// MM-047 — Course card for the Learn hub list.

import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CoursesQuery } from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

type CourseItem = CoursesQuery['courses'][number];

interface CourseCardProps {
  course: CourseItem;
  onPress: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export function CourseCard({ course, onPress }: CourseCardProps): React.JSX.Element {
  const total = course.lessons.length;
  const done = course.progress?.lessonsComplete ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = done >= total && total > 0;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-border-subtle bg-bg-secondary p-4 gap-3 active:opacity-70"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-text-primary" numberOfLines={2}>
            {course.title}
          </Text>
          <Text className="text-xs text-text-tertiary">
            {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty} · {course.totalTimeMin} min
          </Text>
        </View>
        <ChevronRight size={18} color={tokens.text.tertiary} strokeWidth={1.75} />
      </View>

      <Text className="text-sm leading-5 text-text-secondary" numberOfLines={2}>
        {course.description}
      </Text>

      {/* Progress bar */}
      <View className="gap-1.5">
        <View className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden">
          <View
            className="h-full rounded-full bg-accent"
            style={{ width: `${pct}%` }}
          />
        </View>
        <Text className="text-xs text-text-tertiary">
          {isComplete
            ? 'Completed'
            : done === 0
              ? `${total} lessons`
              : `${done} of ${total} lessons`}
        </Text>
      </View>
    </Pressable>
  );
}
