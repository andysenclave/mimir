// 30-day equity curve sparkline — react-native-svg polyline (victory-native deferred).
// Rendered inside the summary card (MM-073), so it carries no header/labels/margins —
// just the smooth line + faint gradient fill, matching the v2 mockup.

import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

import type { EquityPoint } from './hooks/usePortfolio';

import { useThemeTokens } from '@/theme/use-theme-tokens';

const CHART_HEIGHT = 56;
const CHART_PAD = 4;
const REF_WIDTH = 340;

interface EquityCurveChartProps {
  points: EquityPoint[];
}

function buildPath(values: number[], width: number): { points: string; fillPoints: string } {
  if (values.length < 2) {
    const flat = `0,${CHART_HEIGHT / 2} ${width},${CHART_HEIGHT / 2}`;
    return { points: flat, fillPoints: `0,${CHART_HEIGHT} ${flat} ${width},${CHART_HEIGHT}` };
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
  return { points: lineStr, fillPoints: `0,${CHART_HEIGHT} ${lineStr} ${width},${CHART_HEIGHT}` };
}

export function EquityCurveChart({ points }: EquityCurveChartProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const values = useMemo(() => points.map((p) => p.value), [points]);
  const startVal = values[0] ?? 0;
  const endVal = values[values.length - 1] ?? 0;
  const isPositive = endVal >= startVal;
  // SVG stroke/gradient need a color value (not a className); use the design
  // tokens so the curve matches gain/loss everywhere else (prompt 05).
  const strokeColor = isPositive ? tokens.gain : tokens.loss;
  const gradId = isPositive ? 'gainGrad' : 'lossGrad';

  const { points: linePoints, fillPoints } = useMemo(() => buildPath(values, REF_WIDTH), [values]);

  return (
    <View className="overflow-hidden">
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
        <Polygon points={fillPoints} fill={`url(#${gradId})`} />
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
  );
}
