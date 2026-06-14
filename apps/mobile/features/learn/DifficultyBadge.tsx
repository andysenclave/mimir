// MM-075 — difficulty pill badge (BEGINNER / INTERMEDIATE / ADVANCED).

import { Text, View } from 'react-native';

interface DifficultyBadgeProps {
  difficulty: string;
}

const STYLES: Record<string, { box: string; text: string; label: string }> = {
  BEGINNER: { box: 'bg-gain/15', text: 'text-gain', label: 'Beginner' },
  INTERMEDIATE: { box: 'bg-warning/15', text: 'text-warning', label: 'Intermediate' },
  ADVANCED: { box: 'bg-loss/15', text: 'text-loss', label: 'Advanced' },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps): React.JSX.Element {
  const s = STYLES[difficulty] ?? {
    box: 'bg-bg-tertiary',
    text: 'text-text-secondary',
    label: difficulty,
  };
  return (
    <View className={`self-center rounded-full px-2.5 py-1 ${s.box}`}>
      <Text className={`text-[10px] font-bold uppercase tracking-wide ${s.text}`}>{s.label}</Text>
    </View>
  );
}
