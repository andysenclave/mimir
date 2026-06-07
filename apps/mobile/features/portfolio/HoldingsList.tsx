// FlashList of holdings — rule: FlashList for any list > 20 items potential.
// Section header included for labeling.

import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { HoldingRow } from './HoldingRow';
import type { PortfolioHolding } from './hooks/usePortfolio';

interface HoldingsListProps {
  holdings: PortfolioHolding[];
}

export function HoldingsList({ holdings }: HoldingsListProps): React.JSX.Element {
  return (
    <View className="mt-4">
      <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide px-4 mb-2">
        Holdings ({holdings.length})
      </Text>
      <View className="bg-surface-elevated rounded-2xl mx-4 overflow-hidden">
        <FlashList
          data={holdings}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <HoldingRow holding={item} />}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
