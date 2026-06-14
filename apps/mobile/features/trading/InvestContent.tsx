// InvestContent — assembles all invest screen sub-sections (prompt 20, SRP).
// Data is provided by useInvestScreen; this component is pure layout.

import { ScrollView, View } from 'react-native';

import { AIInsightCard } from './AIInsightCard';
import { LivePriceTicker } from './LivePriceTicker';
import { MiniChart } from './MiniChart';
import { OrderForm } from './OrderForm';
import { StockHeader } from './StockHeader';

import type { UseInvestScreenResult } from './hooks/useInvestScreen';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SoftPrompt } from '@/features/notifications/SoftPrompt';
import { useSheet } from '@/features/sheets/SheetProvider';

interface InvestContentProps {
  result: UseInvestScreenResult;
}

export function InvestContent({ result }: InvestContentProps): React.JSX.Element {
  const { openSheet } = useSheet();
  const {
    stock,
    intradayPoints,
    holding,
    cashRemaining,
    side,
    quantity,
    setSide,
    setQuantity,
    submitting,
    handleSubmit,
    softPromptVisible,
    softPromptSymbol,
    onSoftPromptAccept,
    onSoftPromptDefer,
  } = result;

  function onFormSubmit(): void {
    if (!stock) return;
    openSheet({
      type: 'orderConfirm',
      symbol: stock.symbol,
      name: stock.name,
      orderType: side,
      quantity,
      ltp: stock.ltp,
      cashRemaining,
      onConfirm: handleSubmit,
    });
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <StockHeader symbol={stock?.symbol ?? ''} name={stock?.name} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <LivePriceTicker
          ltp={stock?.ltp ?? 0}
          change={stock?.change}
          changePct={stock?.changePct}
        />
        <MiniChart points={intradayPoints} positive={(stock?.changePct ?? 0) >= 0} />
        <AIInsightCard symbol={stock?.symbol ?? ''} />
        {softPromptVisible ? (
          <View className="mx-4 mt-4">
            <SoftPrompt
              primaryStockSymbol={softPromptSymbol}
              onAccept={() => void onSoftPromptAccept()}
              onDefer={onSoftPromptDefer}
            />
          </View>
        ) : (
          <OrderForm
            symbol={stock?.symbol ?? ''}
            ltp={stock?.ltp ?? 0}
            cashRemaining={cashRemaining}
            holding={
              holding ? { quantity: holding.quantity, avgBuyPrice: holding.avgBuyPrice } : null
            }
            side={side}
            quantity={quantity}
            onSideChange={setSide}
            onQuantityChange={setQuantity}
            onSubmit={onFormSubmit}
            loading={submitting}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
