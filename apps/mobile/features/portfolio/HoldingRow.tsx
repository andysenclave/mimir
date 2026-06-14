// Single holding row (MM-073) — symbol + shares, "Avg → LTP", prominent P&L + % pill.
// Tappable → navigates to invest/[symbol].

import { formatINR } from '@mimir/shared';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { PortfolioHolding } from './hooks/usePortfolio';

interface HoldingRowProps {
  holding: PortfolioHolding;
}

export function HoldingRow({ holding }: HoldingRowProps): React.JSX.Element {
  const { symbol, quantity, avgBuyPrice, ltp, unrealizedPnl, unrealizedPnlPct } = holding;
  const isPositive = unrealizedPnl >= 0;
  const pnlColor = isPositive ? 'text-gain' : 'text-loss';
  const pnlSign = isPositive ? '+' : '';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/invest/[symbol]', params: { symbol } })}
      className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3.5 active:opacity-70"
    >
      {/* Left: symbol + shares + avg → LTP */}
      <View className="mr-3 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-text-primary text-sm font-semibold">{symbol}</Text>
          <Text className="text-text-tertiary font-mono text-xs">{quantity} shares</Text>
        </View>
        <Text className="text-text-tertiary font-mono text-xs">
          Avg {formatINR(avgBuyPrice)} → LTP {formatINR(ltp)}
        </Text>
      </View>

      {/* Right: prominent P&L + % pill */}
      <View className="items-end gap-1">
        <Text className={`font-mono text-sm font-semibold ${pnlColor}`}>
          {pnlSign}
          {formatINR(unrealizedPnl)}
        </Text>
        <View className={`rounded-full px-2 py-0.5 ${isPositive ? 'bg-gain/10' : 'bg-loss/10'}`}>
          <Text className={`font-mono text-xs font-medium ${pnlColor}`}>
            {pnlSign}
            {unrealizedPnlPct.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
