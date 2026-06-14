// MiniChart — MM-028 intraday line chart via Victory Native XL (D9, CartesianChart + Line).
// Receives real intraday points from useStockIntradayQuery via useInvestScreen.
// Falls back to "Intraday data unavailable" label when market is closed or API returns <2 pts.

import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { tokens } from '@/theme/tokens';

interface MiniChartProps {
  points: Array<{ timestamp: number; price: number }>;
  positive: boolean;
}

export function MiniChart({ points, positive }: MiniChartProps): React.JSX.Element {
  const color = positive ? tokens.gain : tokens.loss;

  // CartesianChart requires numeric x/y keys declared in xKey + yKeys.
  // Memoise so the array isn't rebuilt on every parent re-render (price ticks). MM-063.
  const data = useMemo(() => points.map((p) => ({ x: p.timestamp, y: p.price })), [points]);

  if (points.length < 2) {
    return (
      <View className="mx-4 mb-4 h-20 items-center justify-center rounded-lg bg-surface-elevated">
        <Text className="text-text-tertiary text-xs">Intraday data unavailable</Text>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-4" style={{ height: 80 }}>
      <CartesianChart
        data={data}
        xKey="x"
        yKeys={['y']}
        padding={{ left: 0, right: 0, top: 4, bottom: 4 }}
      >
        {({ points: chartPoints }) => (
          <Line
            points={chartPoints.y}
            color={color}
            strokeWidth={1.5}
            animate={{ type: 'timing', duration: 300 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}
