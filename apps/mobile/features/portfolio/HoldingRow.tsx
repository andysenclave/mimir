// Single holding row — symbol, qty, avgBuyPrice, LTP, unrealized P&L.
// Tappable → navigates to invest/[symbol].

import { Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import { formatINR } from '@mimir/shared';
import type { PortfolioHolding } from './hooks/usePortfolio';

interface HoldingRowProps {
  holding: PortfolioHolding;
}

export function HoldingRow({ holding }: HoldingRowProps): React.JSX.Element {
  const { symbol, name, quantity, avgBuyPrice, ltp, unrealizedPnl, unrealizedPnlPct, totalValue } =
    holding;
  const isPositive = unrealizedPnl >= 0;
  const pnlColor = isPositive ? 'text-gain' : 'text-loss';
  const pnlSign = isPositive ? '+' : '';

  return (
    <Pressable
      onPress={() => router.push(`/invest/${symbol}` as never)}
      className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70 border-b border-border-subtle"
    >
      {/* Left: symbol + name + qty */}
      <View className="flex-1 gap-0.5 mr-3">
        <Text className="text-text-primary text-sm font-semibold">{symbol}</Text>
        {name ? (
          <Text className="text-text-secondary text-xs" numberOfLines={1}>{name}</Text>
        ) : null}
        <Text className="text-text-tertiary text-xs font-mono">
          {quantity} shares · avg {formatINR(avgBuyPrice)}
        </Text>
      </View>

      {/* Right: total value + P&L */}
      <View className="items-end gap-0.5">
        <Text className="text-text-primary text-sm font-mono font-medium">
          {formatINR(totalValue)}
        </Text>
        <Text className="text-text-secondary text-xs font-mono">
          LTP {formatINR(ltp)}
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className={`text-xs font-mono ${pnlColor}`}>
            {pnlSign}{formatINR(unrealizedPnl)}
          </Text>
          <Text className={`text-xs font-mono ${pnlColor}`}>
            ({pnlSign}{unrealizedPnlPct.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
