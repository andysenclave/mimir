// Top summary card — totalValue, P&L, equity sparkline, invested/current/cash row.
// Prompt 22: NativeWind classes only, no inline styles.
// MM-031: totalValue + cash animate via Moti cross-fade on subscription tick.
// MM-073: embedded sparkline + three-column INVESTED / CURRENT / CASH LEFT (amber).

import { formatINR } from '@mimir/shared';
import { MotiView } from 'moti';
import { Text, View } from 'react-native';

import { EquityCurveChart } from './EquityCurveChart';

import type { PortfolioData } from './hooks/usePortfolio';

interface PortfolioSummaryCardProps {
  portfolio: PortfolioData;
}

export function PortfolioSummaryCard({ portfolio }: PortfolioSummaryCardProps): React.JSX.Element {
  const { totalValue, totalPnl, totalPnlPct, totalInvested, budget, equityCurve } = portfolio;
  const isPositive = totalPnl >= 0;
  const pnlColor = isPositive ? 'text-gain' : 'text-loss';
  const pnlSign = isPositive ? '+' : '';

  return (
    <View className="bg-surface-elevated mx-4 mt-4 gap-4 rounded-2xl p-4">
      {/* Portfolio value — animates on subscription tick */}
      <View className="gap-1">
        <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide">
          Total Value
        </Text>
        <MotiView
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 200 }}
          key={totalValue}
        >
          <Text className="text-text-primary font-mono text-3xl font-bold">
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
        <Text className={`font-mono text-lg font-semibold ${pnlColor}`}>
          {pnlSign}
          {formatINR(totalPnl)}
        </Text>
        <View className={`rounded-full px-2 py-0.5 ${isPositive ? 'bg-gain/10' : 'bg-loss/10'}`}>
          <Text className={`font-mono text-xs font-medium ${pnlColor}`}>
            {pnlSign}
            {totalPnlPct.toFixed(2)}%
          </Text>
        </View>
        <Text className="text-text-tertiary text-xs">all time</Text>
      </MotiView>

      {/* Equity sparkline */}
      <EquityCurveChart points={equityCurve} />

      {/* Invested / Current / Cash left */}
      <View className="bg-bg-tertiary flex-row rounded-xl px-3 py-3">
        <View className="flex-1 gap-0.5">
          <Text className="text-text-tertiary text-[10px] font-medium uppercase tracking-wide">
            Invested
          </Text>
          <Text className="text-text-primary font-mono text-sm font-medium">
            {formatINR(totalInvested)}
          </Text>
        </View>
        <View className="flex-1 items-center gap-0.5">
          <Text className="text-text-tertiary text-[10px] font-medium uppercase tracking-wide">
            Current
          </Text>
          <MotiView
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 200 }}
            key={totalValue}
          >
            <Text className="text-text-primary font-mono text-sm font-medium">
              {formatINR(totalValue)}
            </Text>
          </MotiView>
        </View>
        <View className="flex-1 items-end gap-0.5">
          <Text className="text-text-tertiary text-[10px] font-medium uppercase tracking-wide">
            Cash Left
          </Text>
          <MotiView
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 200 }}
            key={budget.cashRemaining}
          >
            <Text className="text-warning font-mono text-sm font-medium">
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
