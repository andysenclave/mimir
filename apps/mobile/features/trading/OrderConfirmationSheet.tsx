// OrderConfirmationSheet — MM-029.
// Bottom sheet triggered from OrderForm CTA (via SheetProvider).
// Uses @gorhom/bottom-sheet. Prompt 23 (dialog-provider-pattern).

import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from 'react-native-reanimated';
import { CheckCircle } from 'lucide-react-native';
import { formatINR } from '@mimir/shared';
import { Button } from '@/components/ui/Button';
import { tokens } from '@/theme/tokens';

interface OrderConfirmationSheetProps {
  symbol: string;
  name: string | null | undefined;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  ltp: number;
  cashRemaining: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

type SheetState = 'idle' | 'loading' | 'success' | 'error';

export function OrderConfirmationSheet({
  symbol,
  name,
  orderType,
  quantity,
  ltp,
  cashRemaining,
  onConfirm,
  onCancel,
}: OrderConfirmationSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheet>(null);
  const [state, setState] = useState<SheetState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const orderValue = quantity * ltp;
  const cashAfter =
    orderType === 'BUY' ? cashRemaining - orderValue : cashRemaining + orderValue;

  const checkScale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleConfirm = useCallback(async () => {
    setState('loading');
    setErrorMsg(null);
    try {
      await onConfirm();
      setState('success');
      checkScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 180 }));
      // Auto-dismiss after 1.5s
      setTimeout(() => {
        sheetRef.current?.close();
      }, 1_500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order failed. Please try again.';
      setErrorMsg(msg);
      setState('error');
    }
  }, [onConfirm, checkScale]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      onClose={onCancel}
      handleIndicatorStyle={{ backgroundColor: tokens.border.strong }}
      backgroundStyle={{ backgroundColor: tokens.bg.secondary }}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, gap: 16 }}>
        {state === 'success' ? (
          <View className="items-center py-6 gap-3">
            <Animated.View style={checkStyle}>
              <CheckCircle size={56} color={tokens.gain} />
            </Animated.View>
            <Text className="text-text-primary font-sans font-semibold text-lg">
              Order placed!
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-text-primary font-sans font-semibold text-lg text-center">
              Confirm Order
            </Text>

            {/* Summary */}
            <View className="bg-bg-tertiary rounded-lg border border-border-subtle p-4 gap-3">
              <View>
                <Text style={{ color: tokens.text.primary, fontFamily: 'Menlo', fontSize: 22, fontWeight: '700' }}>
                  {orderType} {symbol}
                </Text>
                {!!name && (
                  <Text className="text-text-tertiary font-sans text-xs mt-0.5">{name}</Text>
                )}
              </View>
              <View className="h-px bg-border-subtle" />
              <Row label="Quantity" value={`${quantity} shares`} mono />
              <Row label="Price" value={formatINR(ltp)} mono />
              <View className="h-px bg-border-subtle" />
              <Row label="Total" value={formatINR(orderValue)} mono large />
              <View className="h-px bg-border-subtle" />
              <Row label="Cash before" value={formatINR(cashRemaining)} mono />
              <Row label="Cash after" value={formatINR(cashAfter)} mono {...(cashAfter < 0 ? { color: tokens.loss } : {})} />
            </View>

            <Text className="text-text-tertiary font-sans text-xs text-center">
              Educational simulation. Not investment advice.
            </Text>

            {state === 'error' && errorMsg && (
              <Text className="text-loss font-sans text-sm text-center">{errorMsg}</Text>
            )}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button variant="secondary" onPress={onCancel} disabled={state === 'loading'}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant={orderType === 'BUY' ? 'gain' : 'loss'}
                  onPress={() => void handleConfirm()}
                  loading={state === 'loading'}
                >
                  Confirm {orderType}
                </Button>
              </View>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

function Row({
  label,
  value,
  mono,
  large,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  large?: boolean;
  color?: string;
}): React.JSX.Element {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-text-secondary font-sans text-sm">{label}</Text>
      <Text
        style={{
          color: color ?? tokens.text.primary,
          fontFamily: mono ? 'Menlo' : undefined,
          fontSize: large ? 17 : 15,
          fontWeight: large ? '600' : '400',
        }}
      >
        {value}
      </Text>
    </View>
  );
}
