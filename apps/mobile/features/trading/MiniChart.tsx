// Mini intraday chart — simple SVG line using react-native-svg.
// Victory Native XL planned for MM-033+ when historical data is available.
// Renders placeholder gradient shape for now; data wired when intraday API lands.

import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface MiniChartProps {
  /** Data points — if empty, renders a placeholder flat line */
  points?: number[];
  positive?: boolean;
  height?: number;
}

function buildPath(points: number[], width: number, height: number): string {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height * 0.8 - height * 0.1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${coords.join(' L ')}`;
}

export function MiniChart({ points, positive = true, height = 80 }: MiniChartProps): React.JSX.Element {
  const lineColor = positive ? tokens.gain : tokens.loss;
  const placeholderPoints = [100, 102, 101, 103, 105, 104, 106];
  const data = points && points.length >= 2 ? points : placeholderPoints;

  return (
    <View className="px-4" style={{ height }}>
      <Svg width="100%" height={height} viewBox={`0 0 300 ${height}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d={buildPath(data, 300, height)}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
