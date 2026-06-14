// MM-061 — error states.
// CLAUDE.md §13 + MM-061 AC: NEVER render "Something went wrong". Every error has a
// specific heading, a specific message, and (where recoverable) a clear next action.
//
// Two layouts:
//   - full-screen (default) — wraps in ScreenContainer, vertically centred. For
//     "error && no data" cases where the whole screen has nothing to show.
//   - inline (`inline`)      — bare centred block, no ScreenContainer. For a failed
//     section inside an otherwise-populated screen (e.g. AI insight under a price).
//
// Variants carry brand-voice copy (knowing friend, no emoji, Indian phrasing).
// Legacy callers passing only `message` still work: they render icon + message +
// retry with no generic heading.

import { AlertTriangle, Clock, IndianRupee, Sparkles, WifiOff } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useThemeTokens } from '@/theme/use-theme-tokens';

export type ErrorVariant =
  | 'network'
  | 'market-closed'
  | 'insufficient-budget'
  | 'ai-unavailable'
  | 'timeout'
  | 'validation'
  | 'server'
  | 'generic';

interface ErrorPreset {
  icon: LucideIcon;
  heading: string;
  message: string;
}

const PRESETS: Record<ErrorVariant, ErrorPreset> = {
  network: {
    icon: WifiOff,
    heading: 'No connection',
    message: "Can't reach Mimir right now. Check your connection and try again.",
  },
  'market-closed': {
    icon: Clock,
    heading: 'Market is closed',
    message: 'NSE is shut right now. Live prices pick up again when it reopens.',
  },
  'insufficient-budget': {
    icon: IndianRupee,
    heading: 'Not enough budget',
    message: 'This order is more than your remaining monthly budget. Top up or trim the quantity.',
  },
  'ai-unavailable': {
    icon: Sparkles,
    heading: 'Insight unavailable',
    message: 'AI insights are taking a short break. Everything else still works.',
  },
  timeout: {
    icon: Clock,
    heading: 'Taking too long',
    message: 'That request timed out. Give it another try in a moment.',
  },
  validation: {
    icon: AlertTriangle,
    heading: 'Check the details',
    message: 'Something in the form needs a second look before we can continue.',
  },
  server: {
    icon: AlertTriangle,
    heading: "We're on it",
    message: "Mimir's servers hit a snag. We've been notified — please try again shortly.",
  },
  generic: {
    icon: AlertTriangle,
    heading: "Couldn't load this",
    message: 'We hit a snag loading this section. Try again.',
  },
};

interface ErrorStateProps {
  /** Picks brand-voice icon + heading + default message. Defaults to 'generic'. */
  variant?: ErrorVariant;
  /** Override the preset heading. */
  heading?: string;
  /** Override the preset message. Legacy callers passing only this render headingless. */
  message?: string;
  onRetry?: () => void | Promise<void>;
  retryLabel?: string;
  /** Render without ScreenContainer / full-height centring — for a failed section. */
  inline?: boolean;
}

export function ErrorState({
  variant = 'generic',
  heading,
  message,
  onRetry,
  retryLabel = 'Retry',
  inline = false,
}: ErrorStateProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const preset = PRESETS[variant];
  const Icon = preset.icon;

  // Legacy compatibility: a caller passing only `message` (no variant, no heading)
  // gets just that message — never a generic heading layered on top of it.
  const isLegacyMessageOnly =
    message !== undefined && heading === undefined && variant === 'generic';
  const resolvedHeading = heading ?? (isLegacyMessageOnly ? undefined : preset.heading);
  const resolvedMessage = message ?? preset.message;

  const body = (
    <View
      className={
        inline ? 'items-center gap-3 px-6 py-8' : 'flex-1 items-center justify-center gap-4 px-8'
      }
    >
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary">
        <Icon size={28} color={tokens.text.tertiary} strokeWidth={1.5} />
      </View>
      {resolvedHeading !== undefined && (
        <Text className="text-center text-base font-sans font-semibold text-text-primary">
          {resolvedHeading}
        </Text>
      )}
      <Text className="text-center text-sm font-sans leading-5 text-text-secondary">
        {resolvedMessage}
      </Text>
      {onRetry !== undefined && (
        <Button variant="secondary" size="sm" onPress={onRetry} fullWidth={false}>
          {retryLabel}
        </Button>
      )}
    </View>
  );

  if (inline) return body;
  return <ScreenContainer>{body}</ScreenContainer>;
}
