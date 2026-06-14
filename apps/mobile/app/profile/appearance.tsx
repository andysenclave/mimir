// MM-076 — Appearance settings: System / Light / Dark theme selector.

import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SettingsHeader } from '@/features/profile/SettingsHeader';
import { THEME_PREFS, type ThemePref } from '@/lib/theme/theme-preference';
import { useThemePreference } from '@/lib/theme/ThemeProvider';
import { useThemeTokens } from '@/theme/use-theme-tokens';

const OPTIONS: Record<ThemePref, { title: string; subtitle: string }> = {
  system: { title: 'System', subtitle: 'Match your device appearance' },
  light: { title: 'Light', subtitle: 'Always use the light theme' },
  dark: { title: 'Dark', subtitle: 'Always use the dark theme' },
};

export default function AppearanceScreen(): React.JSX.Element {
  const { pref, setPref } = useThemePreference();
  const tokens = useThemeTokens();

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <SettingsHeader title="Appearance" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Theme</Text>
          <View className="bg-surface-elevated overflow-hidden rounded-2xl">
            {THEME_PREFS.map((p, i) => {
              const selected = pref === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPref(p)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`flex-row items-center gap-3 px-4 py-4 active:bg-surface-hover ${
                    i > 0 ? 'border-t border-border-subtle' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-text-primary">
                      {OPTIONS[p].title}
                    </Text>
                    <Text className="text-text-tertiary mt-0.5 text-xs">{OPTIONS[p].subtitle}</Text>
                  </View>
                  {selected && <Check color={tokens.accent} size={18} strokeWidth={2} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
