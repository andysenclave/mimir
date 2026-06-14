// Visual password strength meter — 4 segments + label, colour follows score.
// Hidden when the field is empty so it doesn't add noise to a fresh form.

import clsx from 'clsx';
import { Text, View } from 'react-native';

import { scorePassword } from '@/features/auth/utils/password-strength';

interface PasswordStrengthProps {
  value: string;
}

const TONE: Record<number, string> = {
  0: 'bg-border-default',
  1: 'bg-loss',
  2: 'bg-warning',
  3: 'bg-accent',
  4: 'bg-gain',
};

const LABEL_TONE: Record<number, string> = {
  0: 'text-text-tertiary',
  1: 'text-loss',
  2: 'text-warning',
  3: 'text-accent',
  4: 'text-gain',
};

const READABLE_LABEL: Record<string, string> = {
  none: 'Enter a password',
  weak: 'Weak — add more characters',
  fair: 'Fair — add a mix of cases or symbols',
  good: 'Good',
  strong: 'Strong',
};

export function PasswordStrength({ value }: PasswordStrengthProps): React.JSX.Element | null {
  if (value.length === 0) return null;
  const { score, label } = scorePassword(value);

  return (
    <View className="mt-2 gap-1.5">
      <View className="flex-row gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            className={clsx(
              'h-1 flex-1 rounded-full',
              segment <= score ? TONE[score] : 'bg-border-subtle',
            )}
          />
        ))}
      </View>
      <Text className={clsx('text-xs font-medium', LABEL_TONE[score])}>
        {READABLE_LABEL[label]}
      </Text>
    </View>
  );
}
