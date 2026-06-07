// AI Insight card — placeholder until MM-032 wires the AI backend.
// Grayed out with "Coming soon" so the layout is preserved in the v2 design.

import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

export function AIInsightCard(): React.JSX.Element {
  return (
    <View className="mx-4 rounded-lg bg-bg-tertiary border border-border-subtle p-4">
      <View className="flex-row items-center gap-2 mb-2">
        <Sparkles size={14} color={tokens.text.tertiary} />
        <Text className="text-text-tertiary font-sans text-xs font-medium tracking-wide uppercase">
          AI Insight
        </Text>
      </View>
      <Text className="text-text-tertiary font-sans text-sm leading-relaxed">
        AI insights coming soon. We're analysing this stock for you.
      </Text>
    </View>
  );
}
