// MM-015 — Learn tab placeholder card. Single centred card per the spec:
//   - indigo→emerald gradient that matches the Logo brand mark
//   - "Your AI tutor is in training" heading
//   - subtext explaining the unlock timing (Sprint 5)
//   - decorative BookOpen + Sparkles icon stack
//   - intentionally non-interactive

import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useThemeTokens } from '@/theme/use-theme-tokens';

export function LearnPlaceholder(): React.JSX.Element {
  const tokens = useThemeTokens();
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-accent/30"
        style={{
          shadowColor: tokens.accent,
          shadowOpacity: 0.25,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <LinearGradient
          colors={[`${tokens.accent}26`, `${tokens.gain}1A`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 28 }}
        >
          {/* Icon stack — BookOpen with Sparkles overlay */}
          <View className="mb-6 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-2xl"
              style={{ overflow: 'hidden' }}
            >
              <LinearGradient
                colors={[tokens.accent, tokens.gain]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                }}
              />
              <BookOpen color={tokens.text.primary} size={28} strokeWidth={1.75} />
              {/* Sparkle motif anchored top-right of the icon */}
              <View style={{ position: 'absolute', top: -8, right: -8 }}>
                <Sparkles color={tokens.warning} size={20} strokeWidth={2} />
              </View>
            </View>
          </View>

          <Text className="text-center text-xl font-bold text-text-primary">
            Your AI tutor is in training
          </Text>
          <Text className="mt-3 text-center text-sm leading-5 text-text-secondary">
            Personalised lessons, AI-suggested concepts, and quizzes unlock in Sprint 5. Until then,
            focus on the market.
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}
