// Market-tab stock search input. Dumb component — state lives in useStockSearch.

import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { tokens } from '@/theme/tokens';

interface StockSearchBarProps {
  query: string;
  onChange: (q: string) => void;
  onClear: () => void;
}

export function StockSearchBar({ query, onChange, onClear }: StockSearchBarProps): React.JSX.Element {
  return (
    <View className="px-4 pt-3 pb-2">
      <View className="flex-row items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-3">
        <Search size={18} color={tokens.text.tertiary} strokeWidth={1.75} />
        <TextInput
          value={query}
          onChangeText={onChange}
          placeholder="Search stocks (e.g. RELIANCE)"
          placeholderTextColor={tokens.text.tertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 py-3 font-mono text-base text-text-primary"
        />
        {query.length > 0 && (
          <Pressable onPress={onClear} hitSlop={12} accessibilityLabel="Clear search">
            <X size={18} color={tokens.text.tertiary} strokeWidth={1.75} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
