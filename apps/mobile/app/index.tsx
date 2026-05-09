// Root index screen — placeholder for MM-002 acceptance criteria.
// Replaced by:
//   - MM-009: auth-gate redirects to /(tabs) or /login
//   - MM-014: bottom-tab navigation under /(tabs)/

import { Text, View } from 'react-native';

import { formatINR, isMarketOpen } from '@mimir/shared';

export default function Home(): React.JSX.Element {
  // Sanity: import from @mimir/shared works at runtime.
  const sample = formatINR(123456.78);
  const marketOpen = isMarketOpen();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#0B0B12',
        padding: 24,
      }}
    >
      <Text style={{ color: '#E2E8F0', fontSize: 18 }}>Mimir — MM-002 scaffold</Text>
      <Text style={{ color: '#94A3B8', fontSize: 14 }}>Sample formatted: {sample}</Text>
      <Text style={{ color: '#94A3B8', fontSize: 14 }}>
        NSE market: {marketOpen ? 'OPEN' : 'CLOSED'}
      </Text>
    </View>
  );
}
