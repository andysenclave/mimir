// Mimir logo — gradient square with the "M" mark.
// The accent → gain gradient is the brand mark used across the auth surface,
// onboarding hero, and the empty-state icon for Learn.

import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { tokens } from '@/theme/tokens';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { box: 32, font: 16 },
  md: { box: 56, font: 28 },
  lg: { box: 72, font: 36 },
} as const;

export function Logo({ size = 'md' }: LogoProps): React.JSX.Element {
  const { box, font } = SIZE_MAP[size];
  // Width/height come from props, not from tokens — acceptable inline per
  // prompt 22 (numerics computed from props are exempt).
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{
        width: box,
        height: box,
        // Soft glow under the logo, matches the v2 mock's `0 0 40px accent30`.
        shadowColor: tokens.accent,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <LinearGradient
        colors={[tokens.accent, tokens.gain]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
          width: box,
          height: box,
          borderRadius: 16,
        }}
      />
      <Text className="font-mono font-extrabold text-text-primary" style={{ fontSize: font }}>
        M
      </Text>
    </View>
  );
}
