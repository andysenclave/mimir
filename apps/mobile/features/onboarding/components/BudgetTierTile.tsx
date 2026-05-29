// MM-013 — single tile in the budget-tier picker.
// Visual reference: docs/mockups/tsx/mimir-screens.tsx OnboardingScreen amounts list.

import clsx from 'clsx';
import { Check } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

interface BudgetTierTileProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  popular?: boolean;
  custom?: boolean; // renders sans (label is "Custom"), not mono
}

export function BudgetTierTile({
  label,
  selected,
  onPress,
  popular,
  custom,
}: BudgetTierTileProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        'flex-row items-center justify-between rounded-md border px-4 py-3.5',
        selected ? 'border-accent bg-accent/15' : 'border-border-subtle bg-bg-secondary',
      )}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text
        className={clsx(
          'text-base text-text-primary',
          custom ? 'font-sans' : 'font-mono',
          selected && 'font-semibold',
        )}
      >
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {popular === true && (
          <Text className="text-[10px] font-bold uppercase tracking-wider text-accent">
            POPULAR
          </Text>
        )}
        {selected && (
          <View className="h-5 w-5 items-center justify-center rounded-full bg-accent">
            <Check color={tokens.text.primary} size={12} strokeWidth={3} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
