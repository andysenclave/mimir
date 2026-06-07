// Animated skeleton placeholder for loading states.
// Prompt 15 (how-to-make-a-reusable-component): dumb primitive, no data fetching.
// Uses Reanimated 4 shared values for the pulse animation (1.5s loop, opacity 1→0.35).

import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  /** Extra NativeWind classes (e.g. `mb-3`, `flex-1`). */
  className?: string;
  /** Fixed width in pixels. Omit to let flex/className control width. */
  width?: number;
  /** Height in pixels. Defaults to 16. */
  height?: number;
  /** Fully-rounded pill shape. Defaults to the design-system default radius (8px). */
  rounded?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height = 16,
  rounded = false,
}: SkeletonProps): React.JSX.Element {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.35, { duration: 750 }), -1, true);
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animatedStyle, { height }, width !== undefined ? { width } : undefined]}
      className={`bg-bg-hover ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    />
  );
}
