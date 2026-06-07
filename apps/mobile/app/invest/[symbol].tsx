// MM-028 — Invest/Buy screen.
// Dynamic route: /invest/RELIANCE, /invest/TCS, etc.
// Prompt 30 (screen scaffold): thin wiring of hook + feature components.

import { useLocalSearchParams, router } from 'expo-router';
import { ErrorState } from '@/components/layout/ErrorState';
import { SheetProvider } from '@/features/sheets/SheetProvider';
import { InvestContent, InvestSkeleton, useInvestScreen } from '@/features/trading';
import { usePortfolioQuery } from '@/graphql/generated';

export default function InvestScreen(): React.JSX.Element {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const safeSymbol = symbol ?? '';

  // Portfolio query — provides holding + budget for the order form.
  // Uses cache-first so it doesn't block the invest screen load.
  const { data: portfolioData } = usePortfolioQuery({ fetchPolicy: 'cache-first' });
  const investResult = useInvestScreen(safeSymbol, portfolioData?.portfolio);

  if (investResult.loading && !investResult.stock) return <InvestSkeleton />;
  if (investResult.error && !investResult.stock) {
    return <ErrorState message="Couldn't load stock data." onRetry={() => router.back()} />;
  }

  return (
    <SheetProvider>
      <InvestContent result={investResult} />
    </SheetProvider>
  );
}
