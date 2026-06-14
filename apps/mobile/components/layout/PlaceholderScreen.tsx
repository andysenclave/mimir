// Reusable placeholder for tab screens whose real implementation lives in a
// later sprint story. Keeps the tab shell working end-to-end while individual
// tabs (Portfolio MM-030, Market MM-024, Profile MM-036, Learn polish MM-015)
// land one by one.

import { Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  storyRef: string; // e.g. "MM-030"
}

export function PlaceholderScreen({
  title,
  subtitle,
  icon: Icon,
  storyRef,
}: PlaceholderScreenProps): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-bg-secondary">
          <Icon color={tokens.text.tertiary} size={32} strokeWidth={1.5} />
        </View>
        <Text className="text-2xl font-bold text-text-primary">{title}</Text>
        {subtitle !== undefined && (
          <Text className="mt-2 max-w-xs text-center text-sm text-text-secondary">{subtitle}</Text>
        )}
        <Text className="mt-6 text-xs text-text-tertiary">Lands in {storyRef}.</Text>
      </View>
    </ScreenContainer>
  );
}
