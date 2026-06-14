// MM-013 — Onboarding: monthly budget tier selection.
// Visual reference: docs/mockups/tsx/mimir-screens.tsx OnboardingScreen.
// Behaviour: 5 tiers (₹10K / ₹25K / ₹50K POPULAR / ₹1L / Custom). Skip routes
// through TIER_50K (per session decision). On submit, completeOnboarding
// mutation runs; AuthProvider.updateUser flips onboardingDone=true; splash
// route then redirects to /(tabs)/portfolio (MM-014).

import { BUDGET_TIERS, type BudgetTierId, formatINR } from '@mimir/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BudgetTierTile } from '@/features/onboarding/components/BudgetTierTile';
import { useCompleteOnboarding } from '@/features/onboarding/hooks/useCompleteOnboarding';

const TIER_ORDER: BudgetTierId[] = ['TIER_10K', 'TIER_25K', 'TIER_50K', 'TIER_1L', 'CUSTOM'];

const POPULAR_TIER: BudgetTierId = 'TIER_50K';

export default function BudgetScreen(): React.JSX.Element {
  const [selected, setSelected] = useState<BudgetTierId>(POPULAR_TIER);
  const { complete, loading, error } = useCompleteOnboarding();

  const previewAmount = useMemo(() => BUDGET_TIERS[selected].amount, [selected]);

  const submit = async (tier: BudgetTierId) => {
    try {
      await complete({ budgetTierId: tier });
      // Splash route picks up onboardingDone=true and redirects automatically;
      // explicit replace gets there faster on iOS.
      router.replace('/');
    } catch {
      // Error rendered inline below; no toast needed.
    }
  };

  const firstCycleStart = useMemo(() => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <ScreenContainer>
      <ScrollView contentContainerClassName="flex-grow px-6 pb-6 pt-4">
        <View className="mb-8">
          <ProgressBar totalSteps={3} currentStep={2} />
        </View>

        <Text className="mb-1.5 text-[22px] font-bold text-text-primary">
          Set your monthly budget
        </Text>
        <Text className="mb-8 text-sm leading-5 text-text-secondary">
          This amount credits to your paper portfolio on the 1st of every month. You can change it
          anytime or add more manually.
        </Text>

        {/* Tier picker */}
        <View className="mb-6 gap-2">
          {TIER_ORDER.map((tier) => (
            <BudgetTierTile
              key={tier}
              label={BUDGET_TIERS[tier].label}
              selected={selected === tier}
              onPress={() => setSelected(tier)}
              popular={tier === POPULAR_TIER}
              custom={tier === 'CUSTOM'}
            />
          ))}
        </View>

        {/* Preview */}
        <View className="mb-6 rounded-md border border-border-subtle bg-bg-secondary p-4">
          <Text className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            YOUR STARTING BALANCE
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="font-mono text-3xl font-bold text-text-primary">
              {formatINR(previewAmount).replace('.00', '')}
            </Text>
            <Text className="text-xs text-text-tertiary">/month</Text>
          </View>
          <Text className="mt-2 text-xs text-text-tertiary">
            First credit: {firstCycleStart} · You can also add funds anytime
          </Text>
        </View>

        {/* Submit error */}
        {error !== null && (
          <View className="mb-3 rounded-md border border-loss/30 bg-loss/10 px-3 py-2.5">
            <Text className="text-sm font-medium text-loss">{error}</Text>
          </View>
        )}

        {/* CTA */}
        <View className="mt-auto pt-6">
          <Button onPress={() => void submit(selected)} loading={loading}>
            Continue
          </Button>
          <View className="mt-3 items-center">
            <Text className="text-xs text-text-tertiary" onPress={() => void submit(POPULAR_TIER)}>
              Skip for now — defaults to {BUDGET_TIERS[POPULAR_TIER].label}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
