// Assembler for the portfolio screen (prompt 20 — SRP, < 150 lines).
// Wraps in ScrollView with pull-to-refresh.

import { ScrollView, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PortfolioSummaryCard } from './PortfolioSummaryCard';
import { EquityCurveChart } from './EquityCurveChart';
import { HoldingsList } from './HoldingsList';
import type { PortfolioData } from './hooks/usePortfolio';

interface PortfolioContentProps {
  portfolio: PortfolioData;
  refreshing: boolean;
  onRefresh: () => void;
}

export function PortfolioContent({
  portfolio,
  refreshing,
  onRefresh,
}: PortfolioContentProps): React.JSX.Element {
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PortfolioSummaryCard portfolio={portfolio} />
        <EquityCurveChart points={portfolio.equityCurve} />
        <HoldingsList holdings={portfolio.holdings} />
      </ScrollView>
    </ScreenContainer>
  );
}
