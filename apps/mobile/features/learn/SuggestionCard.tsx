// MM-052 — AI learning suggestion card for the Learn hub.
// Dumb component: data + callback via props (CLAUDE.md §14).

import { BookOpen, Lightbulb } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

interface SuggestionCardProps {
  title: string;
  body: string;
  ctaLink: string;
  onPress: () => void;
}

export function SuggestionCard({
  title,
  body,
  ctaLink,
  onPress,
}: SuggestionCardProps): React.JSX.Element {
  const Icon = ctaLink.startsWith('course:') ? BookOpen : Lightbulb;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-border-subtle bg-bg-secondary p-4 gap-3 active:opacity-70"
    >
      <View className="flex-row items-center gap-2">
        <Icon size={16} color={tokens.accent} strokeWidth={1.75} />
        <Text className="flex-1 text-sm font-semibold text-text-primary" numberOfLines={2}>
          {title}
        </Text>
      </View>

      <Text className="text-sm leading-5 text-text-secondary">{body}</Text>

      <Text className="text-sm font-medium text-accent">Explore →</Text>
    </Pressable>
  );
}
