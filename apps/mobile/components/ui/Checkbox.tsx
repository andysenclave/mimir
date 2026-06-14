// Reusable checkbox with label content (ReactNode so the caller can embed
// links, e.g. "I accept the <Terms>"). Pressing the row toggles the value.

import clsx from 'clsx';
import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { ReactNode } from 'react';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
  error?: string | undefined;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  children,
  error,
  disabled,
}: CheckboxProps): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange(!checked)}
      disabled={disabled}
      className={clsx('flex-row items-start gap-3 rounded-md py-2', disabled && 'opacity-60')}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: disabled === true }}
    >
      <View
        className={clsx(
          'mt-0.5 h-5 w-5 items-center justify-center rounded-md border',
          checked
            ? 'border-accent bg-accent'
            : error !== undefined
              ? 'border-loss bg-bg-secondary'
              : 'border-border-default bg-bg-secondary',
        )}
      >
        {checked && <Check color={tokens.text.primary} size={14} strokeWidth={3} />}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
}
