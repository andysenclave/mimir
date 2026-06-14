// Horizontal divider with optional centered label ("or", etc.).

import { Text, View } from 'react-native';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps): React.JSX.Element {
  if (label === undefined) {
    return <View className="h-px w-full bg-border-subtle" />;
  }
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border-subtle" />
      <Text className="text-[11px] uppercase tracking-wider text-text-tertiary">{label}</Text>
      <View className="h-px flex-1 bg-border-subtle" />
    </View>
  );
}
