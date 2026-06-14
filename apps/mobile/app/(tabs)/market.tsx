// MM-024 — Market Overview screen.
// Prompt 30 (mobile-screen-scaffold): thin screen, wires hook → feature components.
// Prompt 04 (when-component-is-a-page): under 150 lines, no business logic here.
//
// Data:  useMarketOverview() — query (15s poll) + subscription (live movers)
// State: loading / error / data guards → delegates to MarketOverviewContent

import { ErrorState } from '@/components/layout/ErrorState';
import { MarketOverviewContent, MarketOverviewSkeleton } from '@/features/market';
import { useMarketOverview } from '@/features/market/hooks/useMarketOverview';

export default function MarketTab(): React.JSX.Element {
  const { overview, loading, error, refreshing, isOpen, onRefresh } = useMarketOverview();

  // First load — no stale data available yet.
  if (loading && overview === undefined) return <MarketOverviewSkeleton />;

  // Network/GraphQL error with no cached data to fall back on.
  if (error !== undefined && overview === undefined) {
    return <ErrorState variant="network" onRetry={onRefresh} />;
  }

  // Stale data guard — protects against unexpected Apollo states.
  if (overview === undefined) return <MarketOverviewSkeleton />;

  return (
    <MarketOverviewContent
      overview={overview}
      isOpen={isOpen}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
