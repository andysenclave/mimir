// Full-screen error state for query failure.
// Matches MOCKUPS-SCOPED.md Gap 9: "Can't reach Mimir right now. Check your connection. [Retry]"
// Used when both `error` is set AND no stale data is available (error && !data).

import { Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';

import { tokens } from '@/theme/tokens';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void | Promise<void>;
}

export function ErrorState({
  message = "Can't reach Mimir right now. Check your connection.",
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-8 gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary">
          <WifiOff size={28} color={tokens.text.tertiary} strokeWidth={1.5} />
        </View>
        <Text className="text-center text-base font-sans font-semibold text-text-primary">
          Something went wrong
        </Text>
        <Text className="text-center text-sm font-sans text-text-secondary leading-5">
          {message}
        </Text>
        {onRetry !== undefined && (
          <Button variant="secondary" size="sm" onPress={onRetry} fullWidth={false}>
            Retry
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}
