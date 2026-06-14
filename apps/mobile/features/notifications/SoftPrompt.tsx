// MM-018 — soft-prompt UI component.
// Pure presentation. The trigger logic (after first paper trade, deferral
// after Maybe Later, 30-day re-eligibility) lives in MM-042.

import { Bell } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface SoftPromptProps {
  onAccept: () => void;
  onDefer: () => void;
  primaryStockSymbol?: string;
}

export function SoftPrompt({
  onAccept,
  onDefer,
  primaryStockSymbol,
}: SoftPromptProps): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-md bg-accent/15">
        <Bell color={tokens.accent} size={20} strokeWidth={1.75} />
      </View>
      <Text className="text-base font-semibold text-text-primary">
        Get notified when prices move
      </Text>
      <Text className="mt-1 text-sm leading-5 text-text-secondary">
        {primaryStockSymbol !== undefined && primaryStockSymbol.length > 0
          ? `Want price alerts on your new ${primaryStockSymbol} position?`
          : 'Want price alerts on the stocks you hold and watch?'}{' '}
        You can change this anytime in Profile › Notifications.
      </Text>
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1">
          <Button variant="secondary" onPress={onDefer}>
            Maybe later
          </Button>
        </View>
        <View className="flex-1">
          <Button onPress={onAccept}>Yes, enable</Button>
        </View>
      </View>
    </View>
  );
}
