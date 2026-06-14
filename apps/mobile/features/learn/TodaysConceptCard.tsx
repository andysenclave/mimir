// MM-047 / MM-075 — Today's Concept card for the Learn hub.
// Adds a read-time chip, an inline "Read More" expand, and a "Take Quiz" CTA.

import { Lightbulb } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface TodaysConceptCardProps {
  title: string;
  body: string;
  /** Optional — routes to the most relevant course (best-effort; see MM-075 notes). */
  onTakeQuiz?: (() => void) | undefined;
}

function readTimeMin(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function TodaysConceptCard({
  title,
  body,
  onTakeQuiz,
}: TodaysConceptCardProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const [expanded, setExpanded] = useState(false);
  const minutes = readTimeMin(body);

  return (
    <View className="rounded-xl border border-border-subtle bg-bg-secondary p-4 gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-md bg-accent/15">
            <Lightbulb color={tokens.accent} size={15} strokeWidth={1.75} />
          </View>
          <Text className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Today&apos;s Concept
          </Text>
        </View>
        <Text className="text-text-tertiary font-mono text-xs">{minutes} min read</Text>
      </View>

      <Text className="text-base font-semibold text-text-primary">{title}</Text>
      <Text
        className="text-sm leading-5 text-text-secondary"
        numberOfLines={expanded ? undefined : 3}
      >
        {body}
      </Text>

      <View className="mt-1 flex-row gap-2">
        {onTakeQuiz !== undefined && (
          <Pressable
            onPress={onTakeQuiz}
            accessibilityRole="button"
            className="bg-accent flex-1 items-center rounded-lg py-2.5 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-white">Take Quiz →</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          accessibilityRole="button"
          className="bg-bg-tertiary flex-1 items-center rounded-lg py-2.5 active:opacity-70"
        >
          <Text className="text-sm font-medium text-text-primary">
            {expanded ? 'Show Less' : 'Read More'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
