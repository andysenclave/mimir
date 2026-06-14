// MM-058 — Trading Preferences.
// Budget tier change takes effect NEXT cycle (stored as preferredTier; applied by
// the monthly rollover — the active budget is never mutated). Order type is
// Market-only in the MVP and locked.

import { BUDGET_TIERS, type BudgetTierId } from '@mimir/shared';
import { Check, Lock } from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SettingsHeader } from '@/features/profile/SettingsHeader';
import { useProfileQuery, useUpdatePreferredTierMutation } from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

const SELECTABLE_TIERS: BudgetTierId[] = ['TIER_10K', 'TIER_25K', 'TIER_50K', 'TIER_1L'];

export default function TradingPreferencesScreen(): React.JSX.Element {
  const { data } = useProfileQuery();
  const [updatePreferredTier, { loading }] = useUpdatePreferredTierMutation();

  const stats = data?.profile.stats;
  const activeTier = stats?.budgetTierId as BudgetTierId | undefined;
  const preferredTier = (stats?.preferredTierId ?? null) as BudgetTierId | null;
  // The selected option highlights the pending change if set, else the active tier.
  const selected = preferredTier ?? activeTier;

  async function onSelect(tier: BudgetTierId): Promise<void> {
    if (tier === selected) return;
    await updatePreferredTier({ variables: { tier } });
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <SettingsHeader title="Trading Preferences" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        {/* Budget tier */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Monthly budget tier</Text>
          <Text className="text-xs leading-5 text-text-secondary">
            Changes apply from next month&apos;s budget. Your current budget and holdings stay exactly
            as they are.
          </Text>

          <View className="mt-2 gap-2.5">
            {SELECTABLE_TIERS.map((tier) => {
              const isSelected = tier === selected;
              const isActive = tier === activeTier;
              return (
                <Pressable
                  key={tier}
                  disabled={loading}
                  onPress={() => void onSelect(tier)}
                  className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${
                    isSelected
                      ? 'border-accent bg-accent/10'
                      : 'border-border-subtle bg-bg-secondary active:opacity-70'
                  }`}
                >
                  <View className="gap-0.5">
                    <Text className="text-base font-mono font-semibold text-text-primary">
                      {BUDGET_TIERS[tier].label}
                    </Text>
                    <Text className="text-xs text-text-tertiary">
                      {isActive ? 'Current cycle' : `₹${BUDGET_TIERS[tier].amount.toLocaleString('en-IN')} / month`}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color={tokens.accent} strokeWidth={2} />}
                </Pressable>
              );
            })}
          </View>

          {preferredTier !== null && preferredTier !== activeTier && (
            <Text className="mt-1 text-xs text-accent">
              {BUDGET_TIERS[preferredTier].label} takes effect at your next monthly budget.
            </Text>
          )}
        </View>

        {/* Order type — locked in MVP */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Default order type</Text>
          <View className="flex-row items-center justify-between rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3.5 opacity-70">
            <View>
              <Text className="text-base font-medium text-text-primary">Market</Text>
              <Text className="text-xs text-text-tertiary">Orders fill at the live price</Text>
            </View>
            <Lock size={16} color={tokens.text.tertiary} strokeWidth={1.75} />
          </View>
          <Text className="text-xs text-text-tertiary">
            Limit and other order types arrive in a later release.
          </Text>
        </View>

        <Text className="text-center text-xs text-text-tertiary">
          Educational simulation. Not investment advice.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
