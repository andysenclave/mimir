// OrderForm — BUY/SELL toggle, quantity stepper, value preview, budget impact, CTA.
// CLAUDE.md §14: every numeric uses mono font. No inline styles.

import { formatINR } from '@mimir/shared';
import { Text, View, Pressable, TextInput } from 'react-native';

import { Button } from '@/components/ui/Button';

interface OrderFormProps {
  symbol: string;
  ltp: number;
  cashRemaining: number;
  holding: { quantity: number; avgBuyPrice: number } | null | undefined;
  side: 'BUY' | 'SELL';
  quantity: number;
  onSideChange: (side: 'BUY' | 'SELL') => void;
  onQuantityChange: (qty: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function OrderForm({
  symbol,
  ltp,
  cashRemaining,
  holding,
  side,
  quantity,
  onSideChange,
  onQuantityChange,
  onSubmit,
  loading = false,
}: OrderFormProps): React.JSX.Element {
  const orderValue = quantity * ltp;
  const cashAfter = side === 'BUY' ? cashRemaining - orderValue : cashRemaining + orderValue;
  const canBuy = side === 'BUY' && cashAfter >= 0 && quantity > 0;
  const canSell = side === 'SELL' && (holding?.quantity ?? 0) >= quantity && quantity > 0;
  const canSubmit = side === 'BUY' ? canBuy : canSell;

  // Budget progress bar — fraction of current cash that remains after this order.
  const budgetLeftPct =
    cashRemaining > 0 ? Math.max(0, Math.min(1, cashAfter / cashRemaining)) * 100 : 0;

  const maxSell = holding?.quantity ?? 0;

  function increment(): void {
    if (side === 'SELL' && quantity >= maxSell) return;
    onQuantityChange(quantity + 1);
  }
  function decrement(): void {
    if (quantity <= 1) return;
    onQuantityChange(quantity - 1);
  }

  return (
    <View className="px-4 pb-4 gap-4">
      {/* BUY / SELL toggle */}
      <View className="flex-row bg-bg-secondary rounded-lg border border-border-subtle overflow-hidden">
        {(['BUY', 'SELL'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => onSideChange(s)}
            className={`flex-1 py-3 items-center ${side === s ? (s === 'BUY' ? 'bg-gain' : 'bg-loss') : 'bg-transparent'}`}
          >
            <Text
              className={`font-sans font-semibold text-sm ${
                side === s ? 'text-bg-primary' : 'text-text-secondary'
              }`}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Quantity stepper */}
      <View>
        <Text className="text-text-tertiary font-sans text-xs mb-2">Quantity</Text>
        <View className="flex-row items-center border border-border-default rounded-lg overflow-hidden">
          <Pressable
            onPress={decrement}
            disabled={quantity <= 1}
            className="w-12 h-12 items-center justify-center bg-bg-secondary active:bg-bg-hover"
          >
            <Text className="text-text-primary font-sans text-xl">−</Text>
          </Pressable>

          <TextInput
            className="flex-1 text-center text-text-primary font-mono text-lg"
            value={String(quantity)}
            keyboardType="number-pad"
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              if (!isNaN(n) && n > 0) {
                if (side === 'SELL' && n > maxSell) return;
                onQuantityChange(n);
              }
            }}
            selectTextOnFocus
          />

          <Pressable
            onPress={increment}
            disabled={side === 'SELL' && quantity >= maxSell}
            className="w-12 h-12 items-center justify-center bg-bg-secondary active:bg-bg-hover"
          >
            <Text className="text-text-primary font-sans text-xl">+</Text>
          </Pressable>
        </View>
        {side === 'SELL' && (
          <Text className="text-text-tertiary font-sans text-xs mt-1">{maxSell} available</Text>
        )}
      </View>

      {/* Order value preview */}
      <View className="bg-bg-secondary rounded-lg border border-border-subtle p-3 gap-2.5">
        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary font-sans text-sm">Order Value</Text>
          <Text className="text-text-primary font-mono text-[15px] font-medium">
            {formatINR(orderValue)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary font-sans text-sm">Monthly Budget Left</Text>
          <Text className="text-warning font-mono text-[15px] font-medium">
            {formatINR(cashRemaining)}
          </Text>
        </View>
        {/* Budget progress — accent fill = cash remaining after this order */}
        <View className="h-1.5 overflow-hidden rounded-full bg-bg-hover">
          <View className="h-full rounded-full bg-accent" style={{ width: `${budgetLeftPct}%` }} />
        </View>
        <View className="flex-row items-baseline justify-between">
          <Text className="text-text-secondary font-sans text-sm">After Trade</Text>
          <View className="flex-row items-baseline gap-1">
            <Text
              className={`font-mono text-[15px] font-medium ${cashAfter >= 0 ? 'text-text-primary' : 'text-loss'}`}
            >
              {formatINR(cashAfter)}
            </Text>
            <Text className="text-text-tertiary font-sans text-xs">left</Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <Text className="text-text-tertiary font-sans text-xs text-center">
        Educational simulation. Not investment advice.
      </Text>

      {/* CTA */}
      <Button
        variant={side === 'BUY' ? 'gain' : 'loss'}
        disabled={!canSubmit}
        loading={loading}
        onPress={onSubmit}
      >
        {side} {symbol}
      </Button>
    </View>
  );
}
