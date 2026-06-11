// MM-047 — Today's Concept card for the Learn hub.

import { Lightbulb } from 'lucide-react-native';
import { Text, View } from 'react-native';


import { tokens } from '@/theme/tokens';

interface TodaysConceptCardProps {
  title: string;
  body: string;
}

export function TodaysConceptCard({ title, body }: TodaysConceptCardProps): React.JSX.Element {
  return (
    <View className="rounded-xl border border-border-subtle bg-bg-secondary p-4 gap-3">
      <View className="flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-md bg-accent/15">
          <Lightbulb color={tokens.accent} size={15} strokeWidth={1.75} />
        </View>
        <Text className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Today's Concept
        </Text>
      </View>
      <Text className="text-base font-semibold text-text-primary">{title}</Text>
      <Text className="text-sm leading-5 text-text-secondary">{body}</Text>
    </View>
  );
}
