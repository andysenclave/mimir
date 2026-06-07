// OrderForm — BUY/SELL toggle, quantity stepper, value preview, budget impact, CTA.
// CLAUDE.md §14: every numeric uses mono font. No inline styles.

import { Text, View, Pressable, TextInput } from 'react-native';
import { formatINR } from '@mimir/shared';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/theme/tokens';

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
            style={{ color: tokens.text.primary, fontFamily: 'Menlo' }}
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
          <Text className="text-text-tertiary font-sans text-xs mt-1">
            {maxSell} available
          </Text>
        )}
      </View>

      {/* Order value preview */}
      <View className="bg-bg-secondary rounded-lg border border-border-subtle p-3 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary font-sans text-sm">Order value</Text>
          <Text style={{ color: tokens.text.primary, fontFamily: 'Menlo', fontSize: 15, fontWeight: '500' }}>
            {formatINR(orderValue)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary font-sans text-sm">Cash after</Text>
          <Text style={{ color: cashAfter >= 0 ? tokens.text.primary : tokens.loss, fontFamily: 'Menlo', fontSize: 15, fontWeight: '500' }}>
            {formatINR(cashAfter)}
          </Text>
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
