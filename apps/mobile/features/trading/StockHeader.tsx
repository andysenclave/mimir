// Stock header bar: back button, symbol, name, sector tag.

import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

interface StockHeaderProps {
  symbol: string;
  name: string | null | undefined;
}

export function StockHeader({ symbol, name }: StockHeaderProps): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3 border-b border-border-subtle">
      <Pressable
        onPress={() => router.back()}
        className="p-1 -ml-1 active:opacity-60"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={22} color={tokens.text.primary} />
      </Pressable>
      <View className="flex-1">
        <Text className="text-text-primary font-sans font-semibold text-lg leading-tight">
          {symbol}
        </Text>
        {!!name && (
          <Text className="text-text-tertiary font-sans text-xs mt-0.5" numberOfLines={1}>
            {name}
          </Text>
        )}
      </View>
    </View>
  );
}
