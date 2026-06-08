// Assembler for the portfolio screen (prompt 20 — SRP, < 150 lines).
// MM-030: Holdings | History tab toggle.

import { useState } from 'react';
import { ScrollView, RefreshControl, View, Text, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PortfolioSummaryCard } from './PortfolioSummaryCard';
import { EquityCurveChart } from './EquityCurveChart';
import { HoldingsList } from './HoldingsList';
import { TradeHistoryList } from './TradeHistoryList';
import type { PortfolioData } from './hooks/usePortfolio';

type ActiveTab = 'holdings' | 'history';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('holdings');

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

        {/* Holdings | History tab toggle */}
        <View className="flex-row mx-4 mt-4 bg-surface-elevated rounded-xl p-1">
          <Pressable
            onPress={() => setActiveTab('holdings')}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'holdings' ? 'bg-accent' : ''}`}
          >
            <Text className={`text-sm font-semibold ${activeTab === 'holdings' ? 'text-white' : 'text-text-secondary'}`}>
              Holdings
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'history' ? 'bg-accent' : ''}`}
          >
            <Text className={`text-sm font-semibold ${activeTab === 'history' ? 'text-white' : 'text-text-secondary'}`}>
              History
            </Text>
          </Pressable>
        </View>

        {activeTab === 'holdings' ? (
          <HoldingsList holdings={portfolio.holdings} />
        ) : (
          <TradeHistoryList />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
