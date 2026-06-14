// MM-036 / MM-075 — 2×2 stat-card grid: Total Return, Monthly Budget,
// Courses Done, Quiz Score. Phase 1: coursesDone + quizScore may be 0 → "—".

import { formatINR } from '@mimir/shared';
import { Text, View } from 'react-native';

import type { ProfileData } from './hooks/useProfile';

interface ProfileStatsRowProps {
  stats: ProfileData['stats'];
}

interface StatCardProps {
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
  subClass?: string;
}

function StatCard({
  label,
  value,
  valueClass = 'text-text-primary',
  sub,
  subClass = 'text-text-tertiary',
}: StatCardProps): React.JSX.Element {
  return (
    <View className="bg-surface-elevated flex-1 gap-1 rounded-2xl px-4 py-3.5">
      <Text className="text-text-tertiary text-xs">{label}</Text>
      <Text className={`font-mono text-lg font-bold ${valueClass}`}>{value}</Text>
      {sub !== undefined ? <Text className={`font-mono text-xs ${subClass}`}>{sub}</Text> : null}
    </View>
  );
}

export function ProfileStatsRow({ stats }: ProfileStatsRowProps): React.JSX.Element {
  const positive = stats.totalReturnPct >= 0;
  const returnColor = positive ? 'text-gain' : 'text-loss';
  const sign = positive ? '+' : '';

  return (
    <View className="mx-4 mt-4 gap-3">
      <View className="flex-row gap-3">
        <StatCard
          label="Total Return"
          value={`${sign}${formatINR(stats.totalReturnInr)}`}
          valueClass={returnColor}
          sub={`${sign}${stats.totalReturnPct.toFixed(2)}%`}
          subClass={returnColor}
        />
        <StatCard label="Monthly Budget" value={stats.budgetTierLabel} sub="/month" />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          label="Courses Done"
          value={stats.coursesDone > 0 ? String(stats.coursesDone) : '—'}
          valueClass={stats.coursesDone > 0 ? 'text-text-primary' : 'text-text-tertiary'}
        />
        <StatCard
          label="Quiz Score"
          value={stats.quizScore > 0 ? `${stats.quizScore}%` : '—'}
          valueClass={stats.quizScore > 0 ? 'text-accent' : 'text-text-tertiary'}
        />
      </View>
    </View>
  );
}
