// Market screen header (MM-074) — title + live/closed status with a timestamp.
// "● NSE Live · 6 Mar, 15:12 IST" when open; muted "Market Closed" otherwise.

import { Text, View } from 'react-native';

interface MarketHeaderProps {
  fetchedAt: string;
  isOpen: boolean;
}

function formatIstTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function MarketHeader({ fetchedAt, isOpen }: MarketHeaderProps): React.JSX.Element {
  const time = formatIstTimestamp(fetchedAt);
  const status = isOpen ? 'NSE Live' : 'Market Closed';

  return (
    <View className="px-4 pb-3 pt-2">
      <Text className="text-text-primary text-2xl font-bold">Market</Text>
      <View className="mt-1 flex-row items-center gap-2">
        <View className={`h-2 w-2 rounded-full ${isOpen ? 'bg-gain' : 'bg-text-tertiary'}`} />
        <Text className="text-text-tertiary text-xs">
          {status}
          {time ? ` · ${time} IST` : ''}
        </Text>
      </View>
    </View>
  );
}
