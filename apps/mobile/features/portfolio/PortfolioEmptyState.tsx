// MM-030 / MM-060 — shown when the user has no holdings yet.
// Thin wrapper over the shared EmptyState (full-screen + CTA + disclaimer).

import { router } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';

import { EmptyState } from '@/components/layout/EmptyState';

export function PortfolioEmptyState(): React.JSX.Element {
  return (
    <EmptyState
      icon={TrendingUp}
      heading="No holdings yet"
      message="Browse the market and place your first paper trade to get started."
      ctaLabel="Browse Market"
      onCtaPress={() => router.replace('/(tabs)/market' as never)}
      disclaimer
    />
  );
}
