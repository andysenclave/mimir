// Market segmented tabs (MM-074) — Overview / Stocks / Sectors.
// Overview is live; Stocks & Sectors deep views are deferred (plan §5.4 F-20),
// so selecting them shows a "coming soon" placeholder (see MarketComingSoon).

import { Pressable, Text, View } from 'react-native';

export const MARKET_TABS = ['overview', 'stocks', 'sectors'] as const;
export type MarketTab = (typeof MARKET_TABS)[number];

const TAB_LABEL: Record<MarketTab, string> = {
  overview: 'Overview',
  stocks: 'Stocks',
  sectors: 'Sectors',
};

interface MarketTabsProps {
  active: MarketTab;
  onChange: (tab: MarketTab) => void;
}

export function MarketTabs({ active, onChange }: MarketTabsProps): React.JSX.Element {
  return (
    <View className="flex-row gap-2 px-4 pb-3">
      {MARKET_TABS.map((tab) => {
        const selected = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={`rounded-full px-4 py-1.5 ${selected ? 'bg-accent' : 'bg-bg-secondary'}`}
          >
            <Text
              className={`text-sm font-medium ${selected ? 'text-white' : 'text-text-secondary'}`}
            >
              {TAB_LABEL[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
