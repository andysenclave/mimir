// Circular progress ring (prompt 15 — reusable UI primitive).
// SVG track + progress arc with an optional centered label. Colors are passed
// in as token values (SVG stroke is a native prop, not a className).

import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  /** Progress 0–100. */
  pct: number;
  size?: number;
  strokeWidth?: number;
  /** Progress arc color (token value). */
  color: string;
  /** Track color (token value). */
  trackColor: string;
  /** Optional center label, e.g. "63%". */
  label?: string;
}

export function ProgressRing({
  pct,
  size = 44,
  strokeWidth = 4,
  color,
  trackColor,
  label,
}: ProgressRingProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(100, pct));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {label !== undefined && (
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-text-primary font-mono text-[11px] font-semibold">{label}</Text>
        </View>
      )}
    </View>
  );
}
