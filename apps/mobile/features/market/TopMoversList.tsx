// Top movers — top 5 gainers + top 5 losers rendered as two stacked sections.
// MM-024 subtask 4. Tapping a row navigates to /invest/[symbol].
// No FlashList (list is ≤ 10 rows, below the 20-item threshold — CLAUDE.md §14).
// All prices and % values in font-mono per CLAUDE.md §14.

import { formatINR } from '@mimir/shared';
import clsx from 'clsx';
import { router } from 'expo-router';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { MarketStockQuote } from './hooks/useMarketOverview';

import { tokens } from '@/theme/tokens';

// ─── Row ──────────────────────────────────────────────────────────────────────

interface MoverRowProps {
  stock: MarketStockQuote;
  isGainer: boolean;
}

function MoverRow({ stock, isGainer }: MoverRowProps): React.JSX.Element {
  const changePct = stock.changePct ?? 0;
  const sign = changePct >= 0 ? '+' : '';

  return (
    <Pressable
      className="flex-row items-center justify-between py-3 active:bg-bg-hover"
      onPress={() => router.push({ pathname: '/invest/[symbol]', params: { symbol: stock.symbol } })}
    >
      <View className="flex-1 pr-3">
        <Text className="font-sans text-sm font-medium text-text-primary" numberOfLines={1}>
          {stock.symbol}
        </Text>
        {stock.name !== null && stock.name !== undefined && (
          <Text className="font-sans text-xs text-text-tertiary" numberOfLines={1}>
            {stock.name}
          </Text>
        )}
      </View>
      <View className="items-end">
        <Text className="font-mono text-sm text-text-primary">{formatINR(stock.ltp)}</Text>
        <Text
          className={clsx('font-mono text-xs', isGainer ? 'text-gain' : 'text-loss')}
        >
          {sign}
          {changePct.toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface MoverSectionProps {
  label: string;
  stocks: MarketStockQuote[];
  isGainer: boolean;
}

function MoverSection({ label, stocks, isGainer }: MoverSectionProps): React.JSX.Element {
  const iconColor = isGainer ? tokens.gain : tokens.loss;
  const Icon = isGainer ? TrendingUp : TrendingDown;

  return (
    <View className="rounded-xl bg-bg-secondary px-4 pb-1 pt-3">
      <View className="mb-1 flex-row items-center gap-2">
        <Icon size={14} color={iconColor} />
        <Text className="font-sans text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </Text>
      </View>
      <View className="h-px bg-border-subtle" />
      {stocks.map((stock) => (
        <MoverRow key={stock.symbol} stock={stock} isGainer={isGainer} />
      ))}
    </View>
  );
}

// ─── Public ───────────────────────────────────────────────────────────────────

interface TopMoversListProps {
  gainers: MarketStockQuote[];
  losers: MarketStockQuote[];
}

export function TopMoversList({ gainers, losers }: TopMoversListProps): React.JSX.Element {
  return (
    <View className="px-4">
      <Text className="mb-3 font-sans text-sm font-semibold text-text-primary">Top Movers</Text>
      <View className="gap-3">
        <MoverSection label="Gainers" stocks={gainers} isGainer />
        <MoverSection label="Losers" stocks={losers} isGainer={false} />
      </View>
    </View>
  );
}
