// Live price ticker — LTP + daily change.
// Uses Reanimated withTiming to flash on every price update.

import { formatINR } from '@mimir/shared';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface LivePriceTickerProps {
  ltp: number;
  change: number | null | undefined;
  changePct: number | null | undefined;
}

export function LivePriceTicker({
  ltp,
  change,
  changePct,
}: LivePriceTickerProps): React.JSX.Element {
  const opacity = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Flash on LTP change — pulse to dim and back.
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.3, { duration: 80 }),
      withTiming(1, { duration: 120 }),
    );
  }, [ltp, opacity]);

  const isPositive = (changePct ?? 0) >= 0;
  const changeClass = isPositive ? 'text-gain' : 'text-loss';
  const sign = isPositive ? '+' : '';

  return (
    <View className="px-4 py-4">
      {/* Reanimated opacity flash on the wrapper; text styling stays in classes. */}
      <Animated.View style={animStyle}>
        <Text className="text-text-primary font-mono text-[36px] font-semibold leading-[44px]">
          {formatINR(ltp)}
        </Text>
      </Animated.View>
      {changePct != null && change != null && (
        <View className="flex-row items-center gap-2 mt-1">
          <Text className={`font-mono text-sm font-medium ${changeClass}`}>
            {sign}
            {formatINR(change)}
          </Text>
          <Text className={`font-mono text-sm font-medium ${changeClass}`}>
            ({sign}
            {changePct.toFixed(2)}%)
          </Text>
        </View>
      )}
    </View>
  );
}
