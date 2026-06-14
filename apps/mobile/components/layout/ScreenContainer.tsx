// Layout primitive — every screen wraps its content in this so safe-area,
// theme background, and consistent padding all live in one place.
// Per prompt 30 — `edges` defaults to top/left/right (tabs handle bottom).

import clsx from 'clsx';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ReactNode } from 'react';

type SafeEdge = 'top' | 'bottom' | 'left' | 'right';

interface ScreenContainerProps {
  children: ReactNode;
  edges?: SafeEdge[];
  className?: string;
}

export function ScreenContainer({
  children,
  edges = ['top', 'left', 'right'],
  className,
}: ScreenContainerProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: edges.includes('top') ? insets.top : 0,
        paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: edges.includes('left') ? insets.left : 0,
        paddingRight: edges.includes('right') ? insets.right : 0,
      }}
      className={clsx('flex-1 bg-bg-primary', className)}
    >
      {children}
    </View>
  );
}
