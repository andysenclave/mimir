// useInvestScreen — MM-028.
// Owns all data + state for the invest screen.
// Prompt 16 (state-management): Apollo owns server state; useState for local form state.
// Prompt 21 (api-client): codegen hooks only.

import { isMarketOpen, uuidv4 } from '@mimir/shared';
import { useState, useCallback, useRef } from 'react';

import { useSoftPromptFlow } from '@/features/notifications/useSoftPromptFlow';
import {
  useStockDetailQuery,
  useStockIntradayQuery,
  useStockPriceUpdateSubscription,
  usePlaceOrderMutation,
  type StockDetailQuery,
  type StockIntradayQuery,
  type PortfolioQuery,
} from '@/graphql/generated';
import { useAnalytics } from '@/lib/analytics/use-analytics';


export type StockData = NonNullable<StockDetailQuery['stock']>;
export type IntradayPoint = NonNullable<StockIntradayQuery['stockIntraday']>[number];
export type PortfolioHolding = NonNullable<PortfolioQuery['portfolio']>['holdings'][number];

export interface UseInvestScreenResult {
  stock: StockData | null | undefined;
  intradayPoints: IntradayPoint[];
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

  softPromptVisible: boolean;
  softPromptSymbol: string;
  onSoftPromptAccept: () => Promise<void>;
  onSoftPromptDefer: () => void;
}

export function useInvestScreen(
  symbol: string,
  portfolioData: PortfolioQuery['portfolio'] | undefined,
): UseInvestScreenResult {
  const isOpen = isMarketOpen(new Date());

  // Guard: never fire the query without a symbol (e.g. a malformed deep link),
  // which would 400 and wedge the screen.
  const hasSymbol = symbol.length > 0;

  const { data, loading, error, client } = useStockDetailQuery({
    variables: { symbol },
    skip: !hasSymbol,
    fetchPolicy: 'cache-and-network',
    pollInterval: isOpen ? 15_000 : 0,
  });

  // MM-028 — intraday series for Victory Native XL MiniChart (1-day, ~5-min intervals).
  // Fetched once per screen mount; no polling (intraday data changes slowly).
  const { data: intradayData } = useStockIntradayQuery({
    variables: { symbol },
    skip: !hasSymbol,
    fetchPolicy: 'cache-first',
  });

  // Patch the stock LTP in Apollo cache on each tick
  useStockPriceUpdateSubscription({
    variables: { symbols: [symbol] },
    skip: !isOpen,
    onData: ({ data: subData }) => {
      const tick = subData.data?.stockPrice;

      if (tick?.symbol !== symbol) return;

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

  // Track whether this is the user's first-ever trade for the PostHog funnel.
  const isFirstTradeRef = useRef<boolean>(!portfolioData || portfolioData.holdings.length === 0);

  const [placeOrder] = usePlaceOrderMutation();
  const { track } = useAnalytics();
  const softPrompt = useSoftPromptFlow();

  const handleSubmit = useCallback(async () => {
    const ltp = data?.stock?.ltp;
    if (!ltp) return;

    // Pure-JS UUID v4 — expo-crypto requires native AES which isn't in Expo Go.
    // This is safe for idempotency keys: the mobile generates and owns the ID.
    const clientGeneratedOrderId = uuidv4();
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
      track({ name: 'order_placed', props: { symbol, type: side, quantity } });
      // triggerAfterTrade handles the first_trade event + soft prompt check +
      // navigation to portfolio. Navigation is deferred until soft prompt resolves.
      await softPrompt.triggerAfterTrade(symbol, isFirstTradeRef.current);
    } finally {
      setSubmitting(false);
    }
  }, [data?.stock?.ltp, placeOrder, symbol, side, quantity, track, softPrompt]);

  return {
    stock: data?.stock,
    intradayPoints: intradayData?.stockIntraday ?? [],
    holding,
    cashRemaining,
    loading,
    error,
    side,
    quantity,
    setSide,
    setQuantity,
    submitting,
    handleSubmit,
    softPromptVisible: softPrompt.visible,
    softPromptSymbol: softPrompt.promptSymbol,
    onSoftPromptAccept: softPrompt.onAccept,
    onSoftPromptDefer: softPrompt.onDefer,
  };
}
