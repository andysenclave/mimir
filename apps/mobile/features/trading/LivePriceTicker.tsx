// Live price ticker — LTP + daily change.
// Uses Reanimated withTiming to flash on every price update.

import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { formatINR } from '@mimir/shared';
import { tokens } from '@/theme/tokens';

interface LivePriceTickerProps {
  ltp: number;
  change: number | null | undefined;
  changePct: number | null | undefined;
}

export function LivePriceTicker({ ltp, change, changePct }: LivePriceTickerProps): React.JSX.Element {
  const opacity = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Flash on LTP change — pulse to dim and back.
  useEffect(() => {
    opacity.value = withSequence(withTiming(0.3, { duration: 80 }), withTiming(1, { duration: 120 }));
  }, [ltp, opacity]);

  const isPositive = (changePct ?? 0) >= 0;
  const changeColor = isPositive ? tokens.gain : tokens.loss;
  const sign = isPositive ? '+' : '';

  return (
    <View className="px-4 py-4">
      <Animated.Text
        style={[animStyle, { color: tokens.text.primary, fontFamily: 'Menlo', fontSize: 36, fontWeight: '600', lineHeight: 44 }]}
      >
        {formatINR(ltp)}
      </Animated.Text>
      {changePct != null && change != null && (
        <View className="flex-row items-center gap-2 mt-1">
          <Text style={{ color: changeColor, fontFamily: 'Menlo', fontSize: 14, fontWeight: '500' }}>
            {sign}{formatINR(change)}
          </Text>
          <Text style={{ color: changeColor, fontFamily: 'Menlo', fontSize: 14, fontWeight: '500' }}>
            ({sign}{changePct.toFixed(2)}%)
          </Text>
        </View>
      )}
    </View>
  );
}
