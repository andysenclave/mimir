// MM-047 / MM-075 — Course row for the Learn hub list.
// Horizontal layout: circular progress ring + title + "{done}/{total} lessons · status".

import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CoursesQuery } from '@/graphql/generated';

import { ProgressRing } from '@/components/ui/ProgressRing';
import { useThemeTokens } from '@/theme/use-theme-tokens';

type CourseItem = CoursesQuery['courses'][number];

interface CourseCardProps {
  course: CourseItem;
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const total = course.lessons.length;
  const done = course.progress?.lessonsComplete ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = done >= total && total > 0;
  const ringColor = isComplete ? tokens.gain : pct > 0 ? tokens.accent : tokens.border.strong;
  const status = isComplete ? 'Completed' : done === 0 ? 'Not started' : 'In progress';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-4 active:opacity-70"
    >
      <ProgressRing
        pct={pct}
        color={ringColor}
        trackColor={tokens.border.default}
        label={`${pct}%`}
      />
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
          {course.title}
        </Text>
        <Text className="text-xs text-text-tertiary">
          <Text className="font-mono">
            {done}/{total}
          </Text>{' '}
          lessons · {status}
        </Text>
      </View>
      <ChevronRight size={18} color={tokens.text.tertiary} strokeWidth={1.75} />
    </Pressable>
  );
}
