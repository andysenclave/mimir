// Top summary card — totalValue, P&L metrics, cash remaining.
// Prompt 22: NativeWind classes only, no inline styles.
// MM-031: totalValue + P&L animate via Moti cross-fade on subscription tick.

import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { formatINR } from '@mimir/shared';
import type { PortfolioData } from './hooks/usePortfolio';

interface PortfolioSummaryCardProps {
  portfolio: PortfolioData;
}

export function PortfolioSummaryCard({ portfolio }: PortfolioSummaryCardProps): React.JSX.Element {
  const { totalValue, totalPnl, totalPnlPct, totalInvested, budget } = portfolio;
  const isPositive = totalPnl >= 0;
  const pnlColor = isPositive ? 'text-gain' : 'text-loss';
  const pnlSign = isPositive ? '+' : '';

  return (
    <View className="bg-surface-elevated rounded-2xl mx-4 mt-4 p-4 gap-4">
      {/* Portfolio value — animates on subscription tick */}
      <View className="gap-1">
        <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide">
          Portfolio Value
        </Text>
        <MotiView
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 200 }}
          key={totalValue}
        >
          <Text className="text-text-primary text-3xl font-mono font-bold">
            {formatINR(totalValue)}
          </Text>
        </MotiView>
      </View>

      {/* P&L row — animates on subscription tick */}
      <MotiView
        className="flex-row items-center gap-2"
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 200 }}
        key={totalPnl}
      >
        <Text className={`text-lg font-mono font-semibold ${pnlColor}`}>
          {pnlSign}{formatINR(totalPnl)}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${isPositive ? 'bg-gain/10' : 'bg-loss/10'}`}
        >
          <Text className={`text-xs font-mono font-medium ${pnlColor}`}>
            {pnlSign}{totalPnlPct.toFixed(2)}%
          </Text>
        </View>
      </MotiView>

      {/* Divider */}
      <View className="h-px bg-border-subtle" />

      {/* Invested + Cash row */}
      <View className="flex-row justify-between">
        <View className="gap-0.5">
          <Text className="text-text-secondary text-xs">Invested</Text>
          <Text className="text-text-primary text-sm font-mono font-medium">
            {formatINR(totalInvested)}
          </Text>
        </View>
        <View className="gap-0.5 items-end">
          <Text className="text-text-secondary text-xs">Cash Available</Text>
          <MotiView
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 200 }}
            key={budget.cashRemaining}
          >
            <Text className="text-text-primary text-sm font-mono font-medium">
              {formatINR(budget.cashRemaining)}
            </Text>
          </MotiView>
        </View>
      </View>

      {/* Disclaimer */}
      <Text className="text-text-tertiary text-xs">
        Educational simulation. Not investment advice.
      </Text>
    </View>
  );
}
