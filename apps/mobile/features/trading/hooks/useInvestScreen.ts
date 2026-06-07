// useInvestScreen — MM-028.
// Owns all data + state for the invest screen.
// Prompt 16 (state-management): Apollo owns server state; useState for local form state.
// Prompt 21 (api-client): codegen hooks only.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';

import {
  useStockDetailQuery,
  useStockPriceUpdateSubscription,
  usePlaceOrderMutation,
  type StockDetailQuery,
  type PortfolioQuery,
} from '@/graphql/generated';
import { isMarketOpen } from '@mimir/shared';

export type StockData = NonNullable<StockDetailQuery['stock']>;
export type PortfolioHolding = NonNullable<PortfolioQuery['portfolio']>['holdings'][number];

export interface UseInvestScreenResult {
  stock: StockData | null | undefined;
  holding: PortfolioHolding | null | undefined;
  cashRemaining: number;
  loading: boolean;
  error: Error | undefined;

  side: 'BUY' | 'SELL';
  quantity: number;
  setSide: (s: 'BUY' | 'SELL') => void;
  setQuantity: (n: number) => void;

  submitting: boolean;
  handleSubmit: () => Promise<void>;
}

export function useInvestScreen(
  symbol: string,
  portfolioData: PortfolioQuery['portfolio'] | undefined,
): UseInvestScreenResult {
  const isOpen = isMarketOpen(new Date());

  const { data, loading, error, client } = useStockDetailQuery({
    variables: { symbol },
    fetchPolicy: 'cache-and-network',
    pollInterval: isOpen ? 15_000 : 0,
  });

  // Patch the stock LTP in Apollo cache on each tick
  useStockPriceUpdateSubscription({
    variables: { symbols: [symbol] },
    skip: !isOpen,
    onData: ({ data: subData }) => {
      const tick = subData.data?.stockPrice;
      if (!tick || tick.symbol !== symbol) return;
      const cacheId = client.cache.identify({ __typename: 'StockQuoteGql', symbol });
      if (!cacheId) return;
      client.cache.modify({
        id: cacheId,
        fields: {
          ltp: () => tick.ltp,
          change: () => tick.change,
          changePct: () => tick.changePct,
        },
      });
    },
  });

  const holding = portfolioData?.holdings.find((h) => h.symbol === symbol) ?? null;
  const cashRemaining = portfolioData?.budget.cashRemaining ?? 0;

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [placeOrder] = usePlaceOrderMutation();

  const handleSubmit = useCallback(async () => {
    const ltp = data?.stock?.ltp;
    if (!ltp) return;

    const clientGeneratedOrderId = Crypto.randomUUID();
    setSubmitting(true);
    try {
      await placeOrder({
        variables: {
          input: {
            symbol,
            type: side,
            quantity,
            clientGeneratedOrderId,
          },
        },
        refetchQueries: ['Portfolio'],
      });
      router.replace('/(tabs)/portfolio');
    } finally {
      setSubmitting(false);
    }
  }, [data?.stock?.ltp, placeOrder, symbol, side, quantity]);

  return {
    stock: data?.stock,
    holding,
    cashRemaining,
    loading,
    error: error as Error | undefined,
    side,
    quantity,
    setSide,
    setQuantity,
    submitting,
    handleSubmit,
  };
}
