// FlashList of holdings with a Sort control (MM-073).
// Tapping Sort cycles P&L → Value → Name; the list re-sorts a local copy.

import { FlashList } from '@shopify/flash-list';
import { ArrowUpDown } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoldingRow } from './HoldingRow';

import type { PortfolioHolding } from './hooks/usePortfolio';

import { useThemeTokens } from '@/theme/use-theme-tokens';

const SORT_MODES = ['pnl', 'value', 'name'] as const;
type SortMode = (typeof SORT_MODES)[number];
const SORT_LABEL: Record<SortMode, string> = { pnl: 'P&L', value: 'Value', name: 'Name' };

function sortHoldings(holdings: PortfolioHolding[], mode: SortMode): PortfolioHolding[] {
  const copy = [...holdings];
  switch (mode) {
    case 'pnl':
      return copy.sort((a, b) => b.unrealizedPnlPct - a.unrealizedPnlPct);
    case 'value':
      return copy.sort((a, b) => b.totalValue - a.totalValue);
    case 'name':
      return copy.sort((a, b) => a.symbol.localeCompare(b.symbol));
    default:
      return copy;
  }
}

interface HoldingsListProps {
  holdings: PortfolioHolding[];
}

export function HoldingsList({ holdings }: HoldingsListProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const [sortMode, setSortMode] = useState<SortMode>('pnl');
  const sorted = useMemo(() => sortHoldings(holdings, sortMode), [holdings, sortMode]);

  function cycleSort(): void {
    setSortMode((m) => SORT_MODES[(SORT_MODES.indexOf(m) + 1) % SORT_MODES.length] ?? 'pnl');
  }

  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between px-4">
        <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide">
          Holdings ({holdings.length})
        </Text>
        <Pressable
          onPress={cycleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort holdings by ${SORT_LABEL[sortMode]}`}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <ArrowUpDown size={13} color={tokens.text.secondary} />
          <Text className="text-text-secondary text-xs font-medium">{SORT_LABEL[sortMode]}</Text>
        </Pressable>
      </View>
      <View className="bg-surface-elevated mx-4 overflow-hidden rounded-2xl">
        <FlashList
          data={sorted}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <HoldingRow holding={item} />}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
