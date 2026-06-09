// MM-038 — Trade detail bottom sheet / modal.
// Shows full order details when a TradeHistoryRow is tapped.
// Uses BottomSheetModal from @gorhom/bottom-sheet (SheetProvider pattern, prompt 23).

import { View, Text, Pressable } from 'react-native';
import { formatINR } from '@mimir/shared';
import type { OrderHistoryQuery } from '@/graphql/generated';

type TradeItem = OrderHistoryQuery['orderHistory'][number];

interface TradeDetailModalProps {
  trade: TradeItem;
  onClose: () => void;
}

export function TradeDetailModal({ trade, onClose }: TradeDetailModalProps): React.JSX.Element {
  const isBuy = trade.type === 'BUY';
  const pillBg = isBuy ? 'bg-gain/15' : 'bg-loss/15';
  const pillText = isBuy ? 'text-gain' : 'text-loss';

  const date = new Date(trade.executedAt);
  const dateTimeStr = date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View className="bg-surface-elevated rounded-t-3xl px-5 pb-10 pt-4">
      {/* Drag handle */}
      <View className="self-center w-10 h-1 rounded-full bg-border-subtle mb-4" />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-2">
          <Text className="text-text-primary text-lg font-bold">{trade.symbol}</Text>
          <View className={`px-2 py-0.5 rounded-md ${pillBg}`}>
            <Text className={`text-xs font-mono font-semibold ${pillText}`}>{trade.type}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text className="text-text-secondary text-sm">Close</Text>
        </Pressable>
      </View>

      {/* Detail rows */}
      <DetailRow label="Quantity" value={`${trade.quantity} share${trade.quantity > 1 ? 's' : ''}`} />
      <DetailRow label="Price per share" value={formatINR(trade.priceAtExecution)} mono />
      <DetailRow label="Total value" value={formatINR(trade.orderValue)} mono highlight />
      {trade.realizedPnl != null && (
        <DetailRow
          label="Realized P&L"
          value={`${trade.realizedPnl >= 0 ? '+' : ''}${formatINR(trade.realizedPnl)}`}
          mono
          pnl={trade.realizedPnl}
        />
      )}
      <DetailRow label="Executed at" value={dateTimeStr} />
      <DetailRow label="Order ID (for support)" value={trade.correlationId} small />

      {/* Compliance footer */}
      <Text className="text-text-tertiary text-xs text-center mt-5">
        Educational simulation. Not investment advice.
      </Text>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  small?: boolean;
  pnl?: number;
}

function DetailRow({ label, value, mono, highlight, small, pnl }: DetailRowProps): React.JSX.Element {
  let valueClass = 'text-text-primary';
  if (highlight) valueClass = 'text-text-primary font-semibold';
  if (pnl !== undefined) valueClass = pnl >= 0 ? 'text-gain' : 'text-loss';
  if (small) valueClass = 'text-text-tertiary';

  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-border-subtle">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text
        className={`text-sm max-w-[55%] text-right ${mono ? 'font-mono' : ''} ${valueClass} ${small ? 'text-xs' : ''}`}
        numberOfLines={small ? 1 : 2}
      >
        {value}
      </Text>
    </View>
  );
}
