// MM-028 — Invest/Buy screen.
// Dynamic route: /invest/RELIANCE, /invest/TCS, etc.
// Prompt 30 (screen scaffold): thin wiring of hook + feature components.

import { useLocalSearchParams, router } from 'expo-router';

import { ErrorState } from '@/components/layout/ErrorState';
import { SheetProvider } from '@/features/sheets/SheetProvider';
import { InvestContent, InvestSkeleton, useInvestScreen } from '@/features/trading';
import { usePortfolioQuery } from '@/graphql/generated';

export default function InvestScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ symbol: string }>();
  const rawSymbol = params.symbol;
  // Defensive: useLocalSearchParams can return string | string[]; take the first.
  const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol;
  const safeSymbol = symbol ?? '';

  // Portfolio query — provides holding + budget for the order form.
  // Uses cache-first so it doesn't block the invest screen load.
  const { data: portfolioData } = usePortfolioQuery({ fetchPolicy: 'cache-first' });
  const investResult = useInvestScreen(safeSymbol, portfolioData?.portfolio);

  // Malformed/empty deep link — no symbol to load. Back is the only sensible action.
  if (safeSymbol.length === 0) {
    return (
      <ErrorState
        heading="Stock not found"
        message="We couldn't tell which stock to open. Head back and pick one from the market."
        retryLabel="Go back"
        onRetry={() => router.back()}
      />
    );
  }

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
