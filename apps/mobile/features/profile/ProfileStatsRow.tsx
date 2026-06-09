// MM-036 — Stats row: total return, budget, courses done, quiz score.
// Phase 1: coursesDone + quizScore are always 0; shown as "—" placeholder.

import { View, Text } from 'react-native';
import { formatINR } from '@mimir/shared';
import type { ProfileData } from './hooks/useProfile';

interface ProfileStatsRowProps {
  stats: ProfileData['stats'];
}

interface StatCellProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatCell({ label, value, valueClass = 'text-text-primary' }: StatCellProps): React.JSX.Element {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className={`text-sm font-mono font-semibold ${valueClass}`}>{value}</Text>
      <Text className="text-xs text-text-tertiary text-center">{label}</Text>
    </View>
  );
}

export function ProfileStatsRow({ stats }: ProfileStatsRowProps): React.JSX.Element {
  const returnColor = stats.totalReturnPct >= 0 ? 'text-gain' : 'text-loss';
  const returnSign  = stats.totalReturnPct >= 0 ? '+' : '';
  const returnPct   = `${returnSign}${stats.totalReturnPct.toFixed(2)}%`;

  return (
    <View className="mx-4 rounded-2xl bg-surface-elevated px-4 py-4">
      <View className="flex-row">
        <StatCell
          label="Total Return"
          value={`${returnSign}${formatINR(stats.totalReturnInr)}`}
          valueClass={returnColor}
        />
        <View className="w-px bg-border-subtle" />
        <StatCell
          label="Return %"
          value={returnPct}
          valueClass={returnColor}
        />
        <View className="w-px bg-border-subtle" />
        <StatCell
          label="Cash Left"
          value={formatINR(stats.cashRemaining)}
        />
      </View>
      <View className="mt-3 pt-3 border-t border-border-subtle flex-row">
        <StatCell
          label="Budget Tier"
          value={stats.budgetTierLabel}
        />
        <View className="w-px bg-border-subtle" />
        <StatCell
          label="Courses"
          value={stats.coursesDone > 0 ? String(stats.coursesDone) : '—'}
          valueClass="text-text-tertiary"
        />
        <View className="w-px bg-border-subtle" />
        <StatCell
          label="Quiz Score"
          value={stats.quizScore > 0 ? String(stats.quizScore) : '—'}
          valueClass="text-text-tertiary"
        />
      </View>
    </View>
  );
}
