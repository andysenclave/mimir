// Primary CTA button. Variants:
//   primary   — accent background, white text (default)
//   secondary — secondary surface, primary text
//   ghost     — transparent, accent text
//   gain      — gain background (BUY)
//   loss      — loss background (SELL)
// Sizing: md (default, 14px padding) and sm (10px padding).

import clsx from 'clsx';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import type { ReactNode } from 'react';

import { tokens } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gain' | 'loss';
type Size = 'sm' | 'md';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-accent active:bg-accent-hover',
  secondary: 'bg-bg-secondary border border-border-subtle active:bg-bg-tertiary',
  ghost: 'bg-transparent active:bg-bg-secondary',
  gain: 'bg-gain active:opacity-90',
  loss: 'bg-loss active:opacity-90',
};

const TEXT: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-text-primary',
  ghost: 'text-accent',
  gain: 'text-bg-primary',
  loss: 'text-white',
};

const SPINNER_COLOR: Record<Variant, string> = {
  primary: tokens.text.primary,
  secondary: tokens.text.primary,
  ghost: tokens.accent,
  gain: tokens.bg.primary,
  loss: tokens.text.primary,
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps): React.JSX.Element {
  const isInteractive = !loading && !disabled;
  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      className={clsx(
        'flex-row items-center justify-center rounded-md',
        size === 'sm' ? 'px-4 py-2.5' : 'px-4 py-3.5',
        fullWidth && 'w-full',
        (loading || disabled) && 'opacity-60',
        CONTAINER[variant],
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={SPINNER_COLOR[variant]} />
      ) : (
        <Text
          className={clsx(
            'font-sans font-semibold',
            size === 'sm' ? 'text-sm' : 'text-base',
            TEXT[variant],
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
