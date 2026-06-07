// MM-030 + MM-031 — Portfolio screen.
// Prompt 30: thin screen wiring hook + feature components.
// SheetProvider here so sell-from-portfolio flow has access to OrderConfirmationSheet.

import { SheetProvider } from '@/features/sheets/SheetProvider';
import {
  PortfolioContent,
  PortfolioEmptyState,
  PortfolioSkeleton,
  usePortfolio,
} from '@/features/portfolio';
import { ErrorState } from '@/components/layout/ErrorState';

function PortfolioScreen(): React.JSX.Element {
  const { portfolio, loading, error, refreshing, onRefresh } = usePortfolio();

  if (loading && !portfolio) return <PortfolioSkeleton />;
  if (error && !portfolio) {
    return <ErrorState message="Couldn't load your portfolio." onRetry={onRefresh} />;
  }
  if (!portfolio?.holdings.length) return <PortfolioEmptyState />;

  return (
    <PortfolioContent
      portfolio={portfolio}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

export default function PortfolioTab(): React.JSX.Element {
  return (
    <SheetProvider>
      <PortfolioScreen />
    </SheetProvider>
  );
}
