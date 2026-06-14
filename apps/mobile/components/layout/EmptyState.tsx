// MM-060 — empty states.
// A successful fetch that returned nothing to show. Distinct from ErrorState
// (a fetch that failed) and skeletons (a fetch in flight).
//
// Two layouts:
//   - full-screen (default) — vertically centred block for a whole-screen empty
//     (e.g. portfolio with no holdings).
//   - inline (`inline`)      — compact block for an empty section inside a screen
//     (e.g. watchlist preview, trade-history list).
//
// Dumb component: icon + copy + optional single CTA via props. No data, no nav
// logic of its own — the caller passes onCtaPress.

import { Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  message: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Render the standing "Educational simulation. Not investment advice." line. */
  disclaimer?: boolean;
  /** Compact section layout (no full-height centring). */
  inline?: boolean;
}

export function EmptyState({
  icon: Icon,
  heading,
  message,
  ctaLabel,
  onCtaPress,
  disclaimer = false,
  inline = false,
}: EmptyStateProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const showCta = ctaLabel !== undefined && onCtaPress !== undefined;

  return (
    <View
      className={
        inline ? 'items-center gap-2 px-6 py-8' : 'flex-1 items-center justify-center gap-5 px-8'
      }
    >
      <View
        className={`items-center justify-center rounded-full bg-surface-elevated ${
          inline ? 'h-12 w-12' : 'h-16 w-16'
        }`}
      >
        <Icon size={inline ? 22 : 32} color={tokens.text.tertiary} strokeWidth={1.5} />
      </View>

      <View className="items-center gap-2">
        <Text
          className={`text-center font-semibold text-text-primary ${
            inline ? 'text-sm' : 'text-lg'
          }`}
        >
          {heading}
        </Text>
        <Text
          className={`text-center leading-5 text-text-secondary ${inline ? 'text-xs' : 'text-sm'}`}
        >
          {message}
        </Text>
      </View>

      {showCta && (
        <Button
          onPress={onCtaPress}
          variant="primary"
          size={inline ? 'sm' : 'md'}
          fullWidth={!inline}
        >
          {ctaLabel}
        </Button>
      )}

      {disclaimer && (
        <Text className="text-center text-xs text-text-tertiary">
          Educational simulation. Not investment advice.
        </Text>
      )}
    </View>
  );
}
