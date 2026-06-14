// Single row in the trade history list — symbol, BUY/SELL pill, qty, price, total, timestamp.

import { formatINR } from '@mimir/shared';
import { View, Text } from 'react-native';

import type { OrderHistoryQuery } from '@/graphql/generated';

type TradeItem = OrderHistoryQuery['orderHistory'][number];

interface TradeHistoryRowProps {
  trade: TradeItem;
}

export function TradeHistoryRow({ trade }: TradeHistoryRowProps): React.JSX.Element {
  const isBuy = trade.type === 'BUY';
  const pillBg = isBuy ? 'bg-gain/15' : 'bg-loss/15';
  const pillText = isBuy ? 'text-gain' : 'text-loss';

  const date = new Date(trade.executedAt);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border-subtle">
      {/* Left: symbol + date + pill */}
      <View className="flex-1 gap-1 mr-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-text-primary text-sm font-semibold">{trade.symbol}</Text>
          <View className={`px-1.5 py-0.5 rounded ${pillBg}`}>
            <Text className={`text-xs font-mono font-semibold ${pillText}`}>{trade.type}</Text>
          </View>
        </View>
        <Text className="text-text-tertiary text-xs">
          {dateStr} · {timeStr}
        </Text>
        <Text className="text-text-secondary text-xs font-mono">
          {trade.quantity} shares @ {formatINR(trade.priceAtExecution)}
        </Text>
      </View>

      {/* Right: total value + realized P&L for sells */}
      <View className="items-end gap-0.5">
        <Text className="text-text-primary text-sm font-mono font-medium">
          {formatINR(trade.orderValue)}
        </Text>
        {trade.realizedPnl != null && (
          <Text
            className={`text-xs font-mono ${trade.realizedPnl >= 0 ? 'text-gain' : 'text-loss'}`}
          >
            {trade.realizedPnl >= 0 ? '+' : ''}
            {formatINR(trade.realizedPnl)}
          </Text>
        )}
      </View>
    </View>
  );
}
