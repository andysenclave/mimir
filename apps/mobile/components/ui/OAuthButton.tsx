// Google / Apple sign-in buttons used on the login + signup screens.
// Visual style matches the v2 mock: secondary surface, subtle border,
// equal-width pair when laid out in a flex row.

import { Globe, Smartphone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

type Provider = 'google' | 'apple';

interface OAuthButtonProps {
  provider: Provider;
  onPress?: () => void;
  disabled?: boolean;
}

const LABEL: Record<Provider, string> = {
  google: 'Google',
  apple: 'Apple',
};

export function OAuthButton({ provider, onPress, disabled }: OAuthButtonProps): React.JSX.Element {
  const Icon = provider === 'google' ? Globe : Smartphone;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className="flex-1 flex-row items-center justify-center gap-2 rounded-md border border-border-subtle bg-bg-secondary px-3 py-3 active:bg-bg-tertiary"
    >
      <View>
        <Icon color={tokens.text.primary} size={16} strokeWidth={1.75} />
      </View>
      <Text className="font-sans text-sm font-medium text-text-primary">{LABEL[provider]}</Text>
    </Pressable>
  );
}
