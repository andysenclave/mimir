// Reusable text input with uppercase-tertiary label, dark surface, and an
// optional inline error message. Matches the v2 mock's input style exactly.
// Designed as a controlled component — pairs with react-hook-form via
// Controller.render's onChange/onBlur/value triple.

import clsx from 'clsx';
import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

export interface InputProps extends Omit<TextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  size?: 'sm' | 'md';
  mono?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, size = 'md', mono, className, editable, ...rest },
  ref,
) {
  const tokens = useThemeTokens();
  const isDisabled = editable === false;

  return (
    <View>
      {label !== undefined && (
        <Text className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={tokens.text.tertiary}
        className={clsx(
          'w-full rounded-md border text-base text-text-primary',
          size === 'sm' ? 'px-3 py-2.5' : 'px-3.5 py-3',
          mono ? 'font-mono' : 'font-sans',
          error ? 'border-loss bg-bg-secondary' : 'border-border-subtle bg-bg-secondary',
          isDisabled && 'opacity-60',
          className,
        )}
        {...rest}
      />
      {error !== undefined && error.length > 0 && (
        <Text className="mt-1.5 text-xs font-medium text-loss">{error}</Text>
      )}
      {error === undefined && hint !== undefined && (
        <Text className="mt-1.5 text-xs text-text-tertiary">{hint}</Text>
      )}
    </View>
  );
});
