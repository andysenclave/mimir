// 30-day equity curve — react-native-svg polyline (victory-native deferred).
// Same buildPath approach as MiniChart but larger with axis hints.

import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { formatINR } from '@mimir/shared';
import type { EquityPoint } from './hooks/usePortfolio';

const CHART_HEIGHT = 100;
const CHART_PAD = 4;

interface EquityCurveChartProps {
  points: EquityPoint[];
}

function buildPath(
  values: number[],
  width: number,
): { points: string; fillPoints: string; min: number; max: number } {
  if (values.length < 2) {
    const flat = `0,${CHART_HEIGHT / 2} ${width},${CHART_HEIGHT / 2}`;
    return {
      points: flat,
      fillPoints: `0,${CHART_HEIGHT} ${flat} ${width},${CHART_HEIGHT}`,
      min: 0,
      max: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usable = CHART_HEIGHT - CHART_PAD * 2;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = CHART_PAD + ((max - v) / range) * usable;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lineStr = coords.join(' ');
  const fillStr = `0,${CHART_HEIGHT} ${lineStr} ${width},${CHART_HEIGHT}`;

  return { points: lineStr, fillPoints: fillStr, min, max };
}

export function EquityCurveChart({ points }: EquityCurveChartProps): React.JSX.Element {
  const values = useMemo(() => points.map((p) => p.value), [points]);
  const startVal = values[0] ?? 0;
  const endVal = values[values.length - 1] ?? 0;
  const isPositive = endVal >= startVal;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';
  const gradId = isPositive ? 'gainGrad' : 'lossGrad';

  // Build path coords at a fixed reference width; SVG viewBox handles scaling
  const REF_WIDTH = 340;
  const { points: linePoints, fillPoints } = useMemo(
    () => buildPath(values, REF_WIDTH),
    [values],
  );

  return (
    <View className="mx-4 mt-4 gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-text-secondary text-xs font-medium">30-Day Equity Curve</Text>
        <Text className="text-text-secondary text-xs">Approximate</Text>
      </View>

      <View className="rounded-xl overflow-hidden bg-surface-elevated">
        <Svg
          width="100%"
          height={CHART_HEIGHT + CHART_PAD * 2}
          viewBox={`0 0 ${REF_WIDTH} ${CHART_HEIGHT + CHART_PAD * 2}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={strokeColor} stopOpacity="0.25" />
              <Stop offset="1" stopColor={strokeColor} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          {/* Gradient fill */}
          <Polygon points={fillPoints} fill={`url(#${gradId})`} />
          {/* Line */}
          <Polyline
            points={linePoints}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Start / end labels */}
      <View className="flex-row justify-between">
        <Text className="text-text-tertiary text-xs font-mono">{formatINR(startVal)}</Text>
        <Text className={`text-xs font-mono font-medium ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {formatINR(endVal)}
        </Text>
      </View>
    </View>
  );
}
